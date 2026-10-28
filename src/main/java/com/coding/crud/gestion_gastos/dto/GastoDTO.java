package com.coding.crud.gestion_gastos.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GastoDTO {

    private long id;
    private String descripcion;
    private BigDecimal monto;
    private String categoria;
    private LocalDate fecha;
}
