package com.symphony.platformsolutions.pizza;

import clients.SymBotClient;
import com.symphony.platformsolutions.pizza.bot.IMListenerImpl;
import com.symphony.platformsolutions.pizza.bot.RoomListenerImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@SpringBootApplication
public class PizzaExtensionBot {
    public static void main(String [] args) {
        SpringApplication.run(PizzaExtensionBot.class, args);
    }

    public PizzaExtensionBot() {
        try {
            SymBotClient botClient = SymBotClient.initBotRsa("config.json");

            botClient.getDatafeedEventsService().addListeners(
                new IMListenerImpl(botClient),
                new RoomListenerImpl(botClient)
            );
        } catch (Exception e) {
            log.error("Error", e);
        }
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
