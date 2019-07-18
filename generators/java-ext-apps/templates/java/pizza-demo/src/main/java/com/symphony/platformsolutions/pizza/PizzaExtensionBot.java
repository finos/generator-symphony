package com.symphony.platformsolutions.pizza;

import authentication.ISymAuth;
import authentication.SymBotRSAAuth;
import clients.SymBotClient;
import com.symphony.platformsolutions.pizza.bot.IMListenerImpl;
import com.symphony.platformsolutions.pizza.bot.RoomListenerImpl;
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
        SymBotClient botClient = SymBotClient.initBotRsa("config.json");

        botClient.getDatafeedEventsService().addListeners(
            new IMListenerImpl(botClient),
            new RoomListenerImpl(botClient)
        );
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
