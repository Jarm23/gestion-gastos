package com.coding.crud.gestion_gastos.repository;

import com.coding.crud.gestion_gastos.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

}
