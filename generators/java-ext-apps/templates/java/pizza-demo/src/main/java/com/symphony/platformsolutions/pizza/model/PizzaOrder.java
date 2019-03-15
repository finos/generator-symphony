package com.symphony.platformsolutions.pizza.model;

import lombok.Data;
import javax.persistence.Entity;
import javax.persistence.Id;

@Data
@Entity
public class PizzaOrder {
    @Id
    private String id;
    private long date;
    private String choice;
}
