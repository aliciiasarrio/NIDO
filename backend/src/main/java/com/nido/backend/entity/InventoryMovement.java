package com.nido.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {

    public enum MovementType {
        ENTRY,
        EXIT,
        TRANSFER,
        ADJUSTMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "source_location_id")
    private Location sourceLocation;

    @ManyToOne
    @JoinColumn(name = "destination_location_id")
    private Location destinationLocation;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected InventoryMovement() {
    }

    public InventoryMovement(Item item, MovementType movementType, Integer quantity,
                             Location sourceLocation, Location destinationLocation, String reason) {
        this.item = item;
        this.movementType = movementType;
        this.quantity = quantity;
        this.sourceLocation = sourceLocation;
        this.destinationLocation = destinationLocation;
        this.reason = reason;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Item getItem() {
        return item;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Location getSourceLocation() {
        return sourceLocation;
    }

    public Location getDestinationLocation() {
        return destinationLocation;
    }

    public String getReason() {
        return reason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
