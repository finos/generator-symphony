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

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class IMListenerImpl implements IMListener {

    private SymBotClient botClient;
    private NLPService nlp;
    private ProcessInstanceClient processInstanceClient;
    private TaskClient taskClient;

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
        String toBeProcessed = inboundMessage.getMessageText().replaceAll("$", "");
        toBeProcessed = toBeProcessed.toLowerCase();
        List<Action> actions = nlp.match(toBeProcessed);
        if (!actions.isEmpty()) {
            Action action = actions.get(0);
            ProcessInstance instance = processInstanceClient.getProcessInstance(inboundMessage.getStream().getStreamId().replace("_", "%"));
            if (instance == null) {

                if (action != null) {
                    ProcessDefinitionInfo info = processInstanceClient.getProcessDefinitionIdFromDeploymentName(action.getAction());
                    Map<String, ValueType> variableMap = new HashMap<>();
                    variableMap.put("streamId", new ValueType(inboundMessage.getStream().getStreamId().replace("_", "%")));
                    variableMap.put("email", new ValueType(inboundMessage.getUser().getEmail()));
                    for (String parameter : action.getParameters().keySet()) {
                        variableMap.put(parameter, new ValueType(action.getParameters().get(parameter)));
                    }
                    processInstanceClient.startProcessInstance(variableMap, info.getId());
                }

            } else {
                if(action!=null){
                    processInstanceClient.setProcessVariable(instance.getId(),action.getAction(),"true");
                }

                for (String parameter : action.getParameters().keySet()) {
                    processInstanceClient.setProcessVariable(instance.getId(),parameter,action.getParameters().get(parameter));
                }
                Task task = taskClient.getTask(instance.getId(), inboundMessage.getUser().getEmail());
                taskClient.completeTask(task.getId());

            }
        } else {
            OutboundMessage messageOut = new OutboundMessage();
            messageOut.setMessage("Hi "+inboundMessage.getUser().getFirstName()+"! How can I help you?");
            try {
                this.botClient.getMessagesClient().sendMessage(inboundMessage.getStream().getStreamId(), messageOut);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void onIMCreated(Stream stream) {

    }
}
