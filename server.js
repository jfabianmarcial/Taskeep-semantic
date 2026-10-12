const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const xmlPath = path.join(__dirname, 'agenda.xml');
const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

app.get('/api/agenda', (req, res) => {
    fs.readFile(xmlPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo XML');
        res.set('Content-Type', 'application/xml');
        res.send(data);
    });
});

app.get('/api/agenda.xsl', (req, res) => {
    res.sendFile(path.join(__dirname, 'agenda.xsl'));
});

// 2. RUTA DE ALTAS (A prueba de fallos)
app.post('/api/notas', (req, res) => {
    const nuevaNota = req.body;
    fs.readFile(xmlPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el XML');
        parser.parseString(data, (err, result) => {
            if (err) return res.status(500).send('Error al analizar el XML');

            const nuevoId = 'n' + Date.now();
            const nodoNota = {
                $: { id: nuevoId, prioridad: nuevaNota.prioridad },
                titulo: nuevaNota.titulo,
                fecha: nuevaNota.fecha,
                contenido: nuevaNota.contenido
            };

            // SALVAVIDAS: Si se borraron todas las notas y desapareció la etiqueta, la recreamos
            if (!result.mi_agenda.cuaderno_notas || typeof result.mi_agenda.cuaderno_notas !== 'object') {
                result.mi_agenda.cuaderno_notas = {};
            }

            let notas = result.mi_agenda.cuaderno_notas.nota;
            if (!notas) result.mi_agenda.cuaderno_notas.nota = [];
            else if (!Array.isArray(notas)) result.mi_agenda.cuaderno_notas.nota = [notas];
            
            result.mi_agenda.cuaderno_notas.nota.push(nodoNota);

            let nuevoXml = builder.buildObject(result);
            nuevoXml = nuevoXml.replace('?>', '?>\n<?xml-stylesheet type="text/xsl" href="agenda.xsl"?>');

            fs.writeFile(xmlPath, nuevoXml, (err) => {
                if (err) return res.status(500).send('Error al guardar el XML');
                res.status(201).send('Nota guardada exitosamente');
            });
        });
    });
});

// 3. RUTA DE BAJAS (A prueba de fallos)
app.delete('/api/notas/:id', (req, res) => {
    const idBorrar = req.params.id;
    fs.readFile(xmlPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el XML');
        parser.parseString(data, (err, result) => {
            if (err) return res.status(500).send('Error al analizar el XML');

            if (!result.mi_agenda.cuaderno_notas || typeof result.mi_agenda.cuaderno_notas !== 'object') {
                return res.status(404).send('No hay notas para borrar');
            }

            let notas = result.mi_agenda.cuaderno_notas.nota;
            if (!notas) return res.status(404).send('No hay notas');
            if (!Array.isArray(notas)) notas = [notas]; 

            const notasRestantes = notas.filter(nota => nota.$.id !== idBorrar);
            result.mi_agenda.cuaderno_notas.nota = notasRestantes;

            let nuevoXml = builder.buildObject(result);
            nuevoXml = nuevoXml.replace('?>', '?>\n<?xml-stylesheet type="text/xsl" href="agenda.xsl"?>');

            fs.writeFile(xmlPath, nuevoXml, (err) => {
                if (err) return res.status(500).send('Error al actualizar el XML');
                res.send('Nota eliminada permanentemente');
            });
        });
    });
});

// 4. RUTA DE CAMBIOS (Actualizar una nota existente)
app.put('/api/notas/:id', (req, res) => {
    const idActualizar = req.params.id;
    const datosNuevos = req.body;

    fs.readFile(xmlPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el XML');
        
        parser.parseString(data, (err, result) => {
            if (err) return res.status(500).send('Error al analizar el XML');

            // Salvavidas por si el XML se había quedado vacío
            if (!result.mi_agenda.cuaderno_notas || typeof result.mi_agenda.cuaderno_notas !== 'object') {
                return res.status(404).send('No hay notas para actualizar');
            }

            let notas = result.mi_agenda.cuaderno_notas.nota;
            if (!notas) return res.status(404).send('No hay notas');
            if (!Array.isArray(notas)) notas = [notas]; 

            // Buscar la nota por su ID
            const indiceNota = notas.findIndex(nota => nota.$.id === idActualizar);
            if (indiceNota === -1) return res.status(404).send('No se encontró el ID');

            // Actualizar solo los campos que el usuario decidió cambiar
            if (datosNuevos.titulo) notas[indiceNota].titulo = datosNuevos.titulo;
            if (datosNuevos.fecha) notas[indiceNota].fecha = datosNuevos.fecha;
            if (datosNuevos.contenido) notas[indiceNota].contenido = datosNuevos.contenido;
            if (datosNuevos.prioridad) notas[indiceNota].$.prioridad = datosNuevos.prioridad;

            let nuevoXml = builder.buildObject(result);
            
            // Volver a inyectar la línea del diseño visual
            nuevoXml = nuevoXml.replace('?>', '?>\n<?xml-stylesheet type="text/xsl" href="agenda.xsl"?>');

            fs.writeFile(xmlPath, nuevoXml, (err) => {
                if (err) return res.status(500).send('Error al actualizar el XML');
                res.send('Nota actualizada correctamente');
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor activo corriendo en http://localhost:${PORT}`);
});