package com.coding.crud.gestion_gastos.repository;

import com.coding.crud.gestion_gastos.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByUsuarioIdOrderByPrioridadAsc(Long usuarioId);
    Optional<Categoria> findByIdAndUsuarioId(Long id, Long usuarioId);
    boolean existsByUsuarioId(Long usuarioId);
    boolean existsByUsuarioIdAndNombreIgnoreCase(Long usuarioId, String nombre);
    boolean existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(Long usuarioId, String nombre, Long id);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Categoria c set c.grupo = null where c.grupo.id = :grupoId")
    void quitarGrupo(Long grupoId);
}
