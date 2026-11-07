package com.coding.crud.gestion_gastos;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GastosApiTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void elRegistroAceptaCualquierPuertoLocalYRechazaOtrosOrigenes() throws Exception {
        for (String origen : new String[]{"https://localhost:5173", "https://localhost:5174"}) {
            mvc.perform(post("/api/v1/auth/registro").header("Origin", origen)
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/v1/auth/registro").header("Origin", "https://otro-sitio.example")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void sinSesionNoSePuedeAcceder() throws Exception {
        mvc.perform(get("/api/v1/categorias")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/gastos").param("anio", "2026")).andExpect(status().isUnauthorized());
    }

    @Test
    void trasElLogoutLaSesionDejaDeValer() throws Exception {
        MockHttpSession sesion = nuevoUsuario();
        mvc.perform(post("/api/v1/auth/logout").session(sesion)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/categorias").session(sesion)).andExpect(status().isUnauthorized());
    }

    @Test
    void lasCategoriasPredeterminadasVanDeGastosFijosAOcio() throws Exception {
        mvc.perform(get("/api/v1/categorias").session(nuevoUsuario()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(7)))
                .andExpect(jsonPath("$[0].nombre").value("Gastos Fijos"))
                .andExpect(jsonPath("$[0].prioridad").value(1))
                .andExpect(jsonPath("$[6].nombre").value("Ocio"))
                .andExpect(jsonPath("$[6].prioridad").value(7));
    }

    @Test
    void crearCategoriaDesplazaLasPrioridades() throws Exception {
        MockHttpSession sesion = nuevoUsuario();
        crearCategoria(sesion, "Mascotas", 2).andExpect(status().isCreated());

        mvc.perform(get("/api/v1/categorias").session(sesion))
                .andExpect(jsonPath("$[*].prioridad", contains(1, 2, 3, 4, 5, 6, 7, 8)))
                .andExpect(jsonPath("$[1].nombre").value("Mascotas"))
                .andExpect(jsonPath("$[2].nombre").value("Alimentación"))
                .andExpect(jsonPath("$[7].nombre").value("Ocio"));
    }

    @Test
    void noSeRepitenNombresDeCategoria() throws Exception {
        crearCategoria(nuevoUsuario(), "gastos fijos", 1).andExpect(status().isConflict());
    }

    @Test
    void categoriaConGastosNoSePuedeEliminar() throws Exception {
        MockHttpSession sesion = nuevoUsuario();
        long categoria = primeraCategoria(sesion);
        crearGasto(sesion, categoria).andExpect(status().isCreated());

        mvc.perform(delete("/api/v1/categorias/" + categoria).session(sesion))
                .andExpect(status().isConflict());
    }

    @Test
    void unUsuarioNoVeNiTocaLoDeOtro() throws Exception {
        MockHttpSession ana = nuevoUsuario();
        MockHttpSession otro = nuevoUsuario();
        long categoriaDeAna = primeraCategoria(ana);
        String gasto = crearGasto(ana, categoriaDeAna).andReturn().getResponse().getContentAsString();
        long gastoDeAna = ((Number) JsonPath.read(gasto, "$.id")).longValue();

        mvc.perform(get("/api/v1/gastos").param("anio", "2026").session(otro))
                .andExpect(jsonPath("$", hasSize(0)));
        crearGasto(otro, categoriaDeAna).andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/gastos/" + gastoDeAna).session(otro)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/categorias/" + categoriaDeAna).session(otro)).andExpect(status().isNotFound());

        mvc.perform(get("/api/v1/gastos").param("anio", "2026").session(ana))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoria").value("Gastos Fijos"));
    }

    private MockHttpSession nuevoUsuario() throws Exception {
        String email = UUID.randomUUID() + "@test.local";
        String credenciales = "\"email\":\"%s\",\"password\":\"secreto123\"".formatted(email);
        mvc.perform(post("/api/v1/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Test\"," + credenciales + "}"))
                .andExpect(status().isCreated());
        return (MockHttpSession) mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{" + credenciales + "}"))
                .andExpect(status().isOk())
                .andReturn().getRequest().getSession(false);
    }

    private long primeraCategoria(MockHttpSession sesion) throws Exception {
        String json = mvc.perform(get("/api/v1/categorias").session(sesion)).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(json, "$[0].id")).longValue();
    }

    private ResultActions crearCategoria(MockHttpSession sesion, String nombre, int prioridad) throws Exception {
        return mvc.perform(post("/api/v1/categorias").session(sesion).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"%s\",\"prioridad\":%d,\"color\":\"#123456\"}".formatted(nombre, prioridad)));
    }

    private ResultActions crearGasto(MockHttpSession sesion, long categoriaId) throws Exception {
        return mvc.perform(post("/api/v1/gastos").session(sesion).contentType(MediaType.APPLICATION_JSON)
                .content("{\"descripcion\":\"Alquiler\",\"monto\":650.50,\"categoriaId\":%d,\"fecha\":\"2026-03-01\"}"
                        .formatted(categoriaId)));
    }
}
