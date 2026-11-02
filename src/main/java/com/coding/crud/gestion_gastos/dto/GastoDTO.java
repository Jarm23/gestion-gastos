package com.coding.crud.gestion_gastos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class GastoDTO {

    private Long id;
    private String descripcion;
    private BigDecimal monto;
    private Long categoriaId;
    private String categoria;
    private LocalDate fecha;
}
