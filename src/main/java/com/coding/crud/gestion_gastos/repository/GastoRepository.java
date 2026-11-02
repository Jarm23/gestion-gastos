package com.coding.crud.gestion_gastos.repository;

import com.coding.crud.gestion_gastos.model.Gasto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

    @EntityGraph(attributePaths = "categoria")
    List<Gasto> findByUsuarioIdAndFechaBetweenOrderByFechaDescIdDesc(Long usuarioId, LocalDate desde, LocalDate hasta);

    Optional<Gasto> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByCategoriaId(Long categoriaId);
}
