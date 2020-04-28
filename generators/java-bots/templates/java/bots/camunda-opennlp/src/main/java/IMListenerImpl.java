import camunda.CamundaConfigLoader;
import camunda.ProcessInstanceClient;
import camunda.TaskClient;
import camunda.model.*;
import clients.SymBotClient;
import listeners.IMListener;
import model.InboundMessage;
import model.OutboundMessage;
import model.Stream;
import nlp.NLPConfig;
import nlp.NLPConfigLoader;
import nlp.NLPService;
import nlp.model.Action;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class IMListenerImpl implements IMListener {
    private SymBotClient botClient;
    private NLPService nlp;
    private ProcessInstanceClient processInstanceClient;
    private TaskClient taskClient;
    private static final Logger LOG = LoggerFactory.getLogger(IMListenerImpl.class);

    public IMListenerImpl(SymBotClient botClient) {
        this.botClient = botClient;
        URL nlpUrl = getClass().getResource("nlp-config.json");
        NLPConfig nlpConfig = NLPConfigLoader.loadFromFile(nlpUrl.getPath());
        nlp = new NLPService(nlpConfig);
        URL camundaURL = getClass().getResource("camunda-config.json");
        CamundaConfig camundaConfig = CamundaConfigLoader.loadFromFile(camundaURL.getPath());
        processInstanceClient = new ProcessInstanceClient(camundaConfig.getCamundaURL());
        taskClient = new TaskClient(camundaConfig.getCamundaURL());
    }

    public void onIMMessage(InboundMessage inboundMessage) {
        String toBeProcessed = inboundMessage.getMessageText().replaceAll("$", "").toLowerCase();
        LOG.info("Received message: {}", toBeProcessed);
        List<Action> actions = nlp.match(toBeProcessed);
        LOG.info("NLP processing complete. Action count = {}", actions.size());

        if (!actions.isEmpty()) {
            Action action = actions.get(0);
            String streamId = inboundMessage.getStream().getStreamId().replace("_", "%");
            ProcessInstance instance = processInstanceClient.getProcessInstance(streamId);

            if (instance == null && action != null) {
                ProcessDefinitionInfo info = processInstanceClient.getProcessDefinitionIdFromDeploymentName(action.getAction());
                Map<String, ValueType> variableMap = new HashMap<>();
                variableMap.put("streamId", new ValueType(streamId));
                variableMap.put("email", new ValueType(inboundMessage.getUser().getEmail()));
                for (String parameter : action.getParameters().keySet()) {
                    variableMap.put(parameter, new ValueType(action.getParameters().get(parameter)));
                }
                processInstanceClient.startProcessInstance(variableMap, info.getId());
                LOG.info("Started process instance {}", info.getId());
            } else if (action != null && action.getParameters() != null) {
                processInstanceClient.setProcessVariable(instance.getId(), action.getAction(), "true");
                for (String parameter : action.getParameters().keySet()) {
                    processInstanceClient.setProcessVariable(instance.getId(), parameter, action.getParameters().get(parameter));
                }
                Task task = taskClient.getTask(instance.getId(), inboundMessage.getUser().getEmail());
                if (task != null) {
                    taskClient.completeTask(task.getId());
                } else {
                    deleteProcessInstance(streamId);
                }
            }
        } else {
            OutboundMessage messageOut = new OutboundMessage();
            messageOut.setMessage("Hi " + inboundMessage.getUser().getFirstName() + "! How can I help you?");
            try {
                this.botClient.getMessagesClient().sendMessage(inboundMessage.getStream().getStreamId(), messageOut);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void deleteProcessInstance(String streamId) {
        streamId = streamId.replace("_", "%");
        ProcessInstance instance = processInstanceClient.getProcessInstance(streamId);
        processInstanceClient.deleteProcessInstance(instance.getId());
    }

    public void onIMCreated(Stream stream) {}
}
