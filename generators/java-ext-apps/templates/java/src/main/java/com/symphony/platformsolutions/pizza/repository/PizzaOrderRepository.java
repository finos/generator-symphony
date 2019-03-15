package com.symphony.platformsolutions.pizza.repository;

import com.symphony.platformsolutions.pizza.model.PizzaOrder;
import org.springframework.data.repository.CrudRepository;

public interface PizzaOrderRepository extends CrudRepository<PizzaOrder, String> {}
