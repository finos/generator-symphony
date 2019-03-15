package com.symphony.platformsolutions.pizza.web;

import com.symphony.platformsolutions.pizza.model.PizzaMenu;
import com.symphony.platformsolutions.pizza.model.PizzaOrder;
import com.symphony.platformsolutions.pizza.repository.PizzaMenuRepository;
import com.symphony.platformsolutions.pizza.repository.PizzaOrderRepository;
import lombok.Synchronized;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
public class WebController {
    private static final Logger LOG = LoggerFactory.getLogger(WebController.class);
    private PizzaOrderRepository pizzaOrderRepository;
    private PizzaMenuRepository pizzaMenuRepository;
    private static List<String> menuOptions;

    public WebController(
        PizzaOrderRepository pizzaOrderRepository,
        PizzaMenuRepository pizzaMenuRepository
    ) {
        this.pizzaOrderRepository = pizzaOrderRepository;
        this.pizzaMenuRepository = pizzaMenuRepository;

        List<PizzaMenu> existingMenu = StreamSupport.stream(pizzaMenuRepository.findAll().spliterator(), false)
            .collect(Collectors.toList());
        if (!existingMenu.isEmpty())
            menuOptions = existingMenu.stream().map(PizzaMenu::getName).collect(Collectors.toList());
        else {
            menuOptions = Arrays.asList("Double Cheese", "Margherita", "Pepperoni");
            pizzaMenuRepository.saveAll(menuOptions.stream().map(PizzaMenu::new).collect(Collectors.toList()));
        }
    }

    public static List<String> getMenuOptions() {
        return menuOptions;
    }

    @GetMapping("/")
    public String home() {
        return "Hello, World";
    }

    @GetMapping("/menu")
    public List<String> getMenu() {
        return menuOptions;
    }

    @Synchronized
    @PostMapping("/menu")
    public List<String> addMenuItem(@RequestBody PizzaMenu menuItem) {
        if (!menuOptions.contains(menuItem.getName())) {
            pizzaMenuRepository.save(menuItem);
            menuOptions.add(menuItem.getName());
        }
        return menuOptions;
    }

    @GetMapping("/orders")
    public List<PizzaOrder> getOrders() {
        return StreamSupport.stream(pizzaOrderRepository.findAll().spliterator(), false)
            .collect(Collectors.toList());
    }

    @GetMapping("/order/{orderId}")
    public PizzaOrder getOrder(@PathVariable String orderId) {
        return pizzaOrderRepository.findById(orderId).orElse(null);
    }

    @PostMapping("/order")
    public PizzaOrder saveOrder(@RequestBody PizzaOrder pizzaOrder) {
        LOG.info("Order Received: {}", pizzaOrder);
        pizzaOrderRepository.save(pizzaOrder);
        return pizzaOrder;
    }
}
