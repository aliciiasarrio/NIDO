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
@Table(name = "items")
public class Item {

    public enum ItemType {
        CONSUMABLE,
        DURABLE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private ItemType itemType;

    @Column(name = "minimum_quantity")
    private Integer minimumQuantity;

    @Column(length = 30)
    private String unit = "unidades";

    @Column(name = "clothing_size", length = 30)
    private String clothingSize;

    @Column(name = "clothing_color", length = 50)
    private String clothingColor;

    @Column(name = "last_worn_at")
    private Instant lastWornAt;

    @Column(name = "image_data", columnDefinition = "TEXT")
    private String imageData;

    @Column(name = "market_reference", length = 150)
    private String marketReference;

    @Column(name = "market_price_min", precision = 10, scale = 2)
    private java.math.BigDecimal marketPriceMin;

    @Column(name = "market_price_max", precision = 10, scale = 2)
    private java.math.BigDecimal marketPriceMax;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    protected Item() {
    }

    public Item(Household household, Category category, String name, String description,
                ItemType itemType, Integer minimumQuantity, String unit,
                String clothingSize, String clothingColor) {
        this.household = household;
        this.category = category;
        this.name = name;
        this.description = description;
        this.itemType = itemType;
        this.minimumQuantity = minimumQuantity;
        this.unit = (unit != null && !unit.isBlank()) ? unit : "unidades";
        this.clothingSize = clothingSize;
        this.clothingColor = clothingColor;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Household getHousehold() {
        return household;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public Integer getMinimumQuantity() {
        return minimumQuantity;
    }

    public void setMinimumQuantity(Integer minimumQuantity) {
        this.minimumQuantity = minimumQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getClothingSize() {
        return clothingSize;
    }

    public void setClothingSize(String clothingSize) {
        this.clothingSize = clothingSize;
    }

    public String getClothingColor() {
        return clothingColor;
    }

    public void setClothingColor(String clothingColor) {
        this.clothingColor = clothingColor;
    }

    public Instant getLastWornAt() {
        return lastWornAt;
    }

    public void setLastWornAt(Instant lastWornAt) {
        this.lastWornAt = lastWornAt;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public String getMarketReference() {
        return marketReference;
    }

    public void setMarketReference(String marketReference) {
        this.marketReference = marketReference;
    }

    public java.math.BigDecimal getMarketPriceMin() {
        return marketPriceMin;
    }

    public void setMarketPriceMin(java.math.BigDecimal marketPriceMin) {
        this.marketPriceMin = marketPriceMin;
    }

    public java.math.BigDecimal getMarketPriceMax() {
        return marketPriceMax;
    }

    public void setMarketPriceMax(java.math.BigDecimal marketPriceMax) {
        this.marketPriceMax = marketPriceMax;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(Instant archivedAt) {
        this.archivedAt = archivedAt;
    }

    public boolean isArchived() {
        return this.archivedAt != null;
    }
}
