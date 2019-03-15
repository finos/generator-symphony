package com.symphony.platformsolutions.pizza;

import authentication.ISymAuth;
import authentication.SymBotRSAAuth;
import clients.SymBotClient;
import com.symphony.platformsolutions.pizza.bot.IMListenerImpl;
import com.symphony.platformsolutions.pizza.bot.RoomListenerTestImpl;
import configuration.SymConfig;
import configuration.SymConfigLoader;
import listeners.IMListener;
import listeners.RoomListener;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import services.DatafeedEventsService;
import java.net.URL;

@SpringBootApplication
public class PizzaExtensionBot {
    public static void main(String [] args) {
        SpringApplication.run(PizzaExtensionBot.class, args);
    }

    public PizzaExtensionBot() {
        URL url = getClass().getClassLoader().getResource("config.json");
        SymConfig config = SymConfigLoader.loadFromFile(url.getPath());
        ISymAuth botAuth = new SymBotRSAAuth(config);
        botAuth.authenticate();
        SymBotClient botClient = SymBotClient.initBot(config, botAuth);
        DatafeedEventsService datafeedEventsService = botClient.getDatafeedEventsService();
        RoomListener roomListenerTest = new RoomListenerTestImpl(botClient);
        datafeedEventsService.addRoomListener(roomListenerTest);
        IMListener imListener = new IMListenerImpl(botClient);
        datafeedEventsService.addIMListener(imListener);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/bundle.json").allowedOrigins("*");
            }
        };
    }
}
