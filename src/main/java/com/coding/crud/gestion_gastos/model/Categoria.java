package com.coding.crud.gestion_gastos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "categorias", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "nombre"}))
@Data
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    // 1 es la más prioritaria
    @Column(nullable = false)
    private int prioridad;

    // Color del gráfico en formato #rrggbb
    @Column(nullable = false, length = 7)
    private String color;

    // Opcional: varias categorías pueden sumarse en un mismo grupo en el gráfico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;
}
