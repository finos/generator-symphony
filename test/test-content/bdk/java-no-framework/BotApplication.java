package com.mycompany.bot;

import static com.symphony.bdk.core.config.BdkConfigLoader.loadFromClasspath;

import com.symphony.bdk.core.SymphonyBdk;
import com.symphony.bdk.core.service.datafeed.RealTimeEventListener;
import com.symphony.bdk.gen.api.model.V4Initiator;
import com.symphony.bdk.gen.api.model.V4MessageSent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * FormReply Sample Application.
 */
public class BotApplication {

  /** The Logger */
  private static final Logger log = LoggerFactory.getLogger(BotApplication.class);

  public static void main(String[] args) throws Exception {

    // Initialize BDK entry point
    final SymphonyBdk bdk = new SymphonyBdk(loadFromClasspath("/config.yaml"));

    // subscribe to "onMessageSent" real-time event
    bdk.datafeed().subscribe(new RealTimeEventListener() {

      @Override
      public void onMessageSent(V4Initiator initiator, V4MessageSent event) {
        // on a message sent, the bot replies with "Hello, {User Display Name}!"
        bdk.messages().send(event.getMessage().getStream(), "<messageML>Hello, " + initiator.getUser().getDisplayName() + "!</messageML>");
      }
    });

    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      log.info("Stopping Datafeed...");
      bdk.datafeed().stop();
    }));

    // finally, start the datafeed read loop
    bdk.datafeed().start();
  }
}
