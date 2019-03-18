package com.symphony.platformsolutions.pizza.repository;

import com.symphony.platformsolutions.pizza.model.PizzaMenu;
import org.springframework.data.repository.CrudRepository;

public interface PizzaMenuRepository extends CrudRepository<PizzaMenu, String> {}
