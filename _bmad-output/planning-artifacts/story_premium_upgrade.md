# Story: Premium Version Upsell & Feature Gating

## Background
Para monetizar y establecer una jerarquía entre oficinas en la plataforma NEXUS, necesitamos implementar una experiencia distintiva entre los agentes de oficinas nivel *Free* y nivel *Premium* (ej. `remax` o `pro`). 
La versión Premium no es un software individual, sino que la oficina REMAX/Broker lo adquiere. No pueden hacerse usuarios individuales sin que la oficina compre e invite a su equipo. Para motivar esta transición, mostraremos las herramientas bloqueadas para que los agentes soliciten el upgrade a sus Brokers.

## Requirements
1. **Gating de Funciones (Restricción B2B)**:
   - Los usuarios con rol estándar (`agent`) no pueden acceder a herramientas exclusivas.
   - **Funciones Bloqueadas Clave:**
     - La invitación a usuarios Co-Buyers al Match Board (Experiencia colaborativa).
     - *(Nota: El ecosistema 'My Business' Kanban es GRATIS para todos, centralizando solo los negocios que hacen en NEXUS).*
2. **El Hook de Upsell (UX)**:
   - Los botones hacia estas funciones siguen siendo visibles, pero llevan un indicador de que son "Premium" (ej. un candado sutil dorado o un resplandor elegante).
   - Al hacer clic, no se deshabilita pasivamente; en su lugar, se invoca una animación fluida que revela el Modal o la Página de Premium Upsell.
3. **Página/Modal Premium (Diseño)**:
   - **Estética Ricamente Diseñada**: Fondos oscuros profundos, capas translúcidas (*glassmorphism*), acentos dorados o luces tipo neón tenues para remarcar el valor "Pro".
   - **Idiomas Dinámicos**: Todo el texto de la página y los mensajes de error/éxito deben cargarse en inglés o español según el idioma del usuario.
4. **Solicitud de Upgrade (Ticketing)**:
   - La llamada a la acción (CTA) debe crear un Ticket interno a los administradores avisando del interés de la oficina en hacer un *upgrade*.

## Acceptance Criteria
- [ ] La base de datos y la interfaz pueden discernir dinámicamente si el `currentUser` es Premium.
- [ ] El intento de navegar a `my-business.html` como usuario estándar redirige a `premium-upgrade.html` (o abre su modal).
- [ ] El diseño de la vista Premium genera un contraste evidente ("Wow effect") con el resto de la aplicación, utilizando los tokens y estilos avanzados definidos en CSS.
- [ ] Un usuario Premium no ve estos bloqueos y experimenta el flujo de trabajo regular.
