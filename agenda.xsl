<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Reporte de Agenda Minimalista</title>
        <style>
         
          :root {
              --bg-color: #fafafa;
              --surface: #ffffff;
              --text-main: #171717;
              --text-muted: #737373;
              --border: #e5e5e5;
              --accent: #000000;
          }

          body { 
              font-family: system-ui, -apple-system, sans-serif; 
              background-color: var(--bg-color); 
              color: var(--text-main); 
              margin: 0; 
              padding: 50px 20px;
              display: flex;
              justify-content: center;
          }

          .contenedor {
              width: 100%;
              max-width: 900px;
          }

          h1 {
              font-size: 28px;
              font-weight: 600;
              letter-spacing: -0.5px;
              margin-bottom: 40px;
              border-bottom: 2px solid var(--accent);
              padding-bottom: 12px;
              display: inline-block;
          }

          h2 {
              font-size: 18px;
              font-weight: 500;
              color: var(--text-muted);
              margin-top: 40px;
              margin-bottom: 16px;
          }
          
          /* Diseño de Tablas Minimalista */
          .tabla-contenedor {
              background: var(--surface);
              border-radius: 12px;
              border: 1px solid var(--border);
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
              overflow: hidden; /* Para que los bordes redondeados apliquen a la tabla */
          }

          table { 
              width: 100%; 
              border-collapse: collapse; 
          }
          
          th, td { 
              padding: 16px 20px; 
              text-align: left; 
              vertical-align: middle;
              border-bottom: 1px solid var(--border);
          }

          th { 
              background-color: #f5f5f5; 
              color: var(--text-muted); 
              text-transform: uppercase; 
              font-size: 12px; 
              font-weight: 600;
              letter-spacing: 0.5px;
          }

          tr:last-child td {
              border-bottom: none;
          }

          tr:hover td { 
              background-color: #fafafa; 
          }

          /* Estilos de texto en celdas */
          .id-celda { font-family: monospace; color: var(--text-muted); font-size: 13px; }
          .titulo-celda { font-weight: 600; font-size: 15px; }
          .fecha-celda { color: var(--text-muted); font-size: 14px; }
          
          /* Etiquetas de prioridad (Badges) */
          .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }

          .prioridad-alta { background-color: #fee2e2; color: #dc2626; }
          .prioridad-media { background-color: #fef3c7; color: #d97706; }
          .prioridad-baja { background-color: #dcfce7; color: #16a34a; }

          a { color: var(--accent); text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="contenedor">
          <h1>Reporte de Agenda</h1>

          <h2>Cuaderno de Notas</h2>
          <div class="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Contenido</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="mi_agenda/cuaderno_notas/nota">
                  <tr>
                    <td class="id-celda"><xsl:value-of select="@id"/></td>
                    <td class="fecha-celda"><xsl:value-of select="fecha"/></td>
                    <td class="titulo-celda"><xsl:value-of select="titulo"/></td>
                    <td><xsl:value-of select="contenido"/></td>
                    <td>
                      <!-- Creación del badge dinámico -->
                      <span>
                        <xsl:attribute name="class">
                          <xsl:value-of select="concat('badge prioridad-', @prioridad)"/>
                        </xsl:attribute>
                        <xsl:value-of select="@prioridad"/>
                      </span>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <h2>Directorio de Contactos</h2>
          <div class="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo Electrónico</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="mi_agenda/directorio/contacto">
                  <tr>
                    <td class="titulo-celda"><xsl:value-of select="nombre"/></td>
                    <td><xsl:value-of select="telefono"/></td>
                    <td><a href="mailto:{correo}"><xsl:value-of select="correo"/></a></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
          
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>