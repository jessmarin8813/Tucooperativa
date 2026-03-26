# Documentation: TuCooperativa Database Schema

## Architecture: Multi-Tenancy (Shared Database)

Our SaaS system uses a **Single Shared Database** with **Logical Separation**. Every table (except `cooperativas` itself) MUST include `cooperativa_id` and have an index on it.

### Core Entities

#### Cooperativas (Tenants)
This is the root level of isolation. All data belongs to a specific Cooperativa.

#### Usuarios (RBAC)
- **Admin**: System-wide or Cooperativa-wide administrators.
- **Dueno (Owner)**: Owns one or more vehicles. Receives daily fees.
- **Chofer (Driver)**: Operates vehicles and registers routes. Pays daily fees.

#### Vehiculos
Assets tracked by the system. Each has a `cuota_diaria` (Fixed Daily Fee).

### Operational Tracking

#### Odometer-based Fuel Detection (Detection 'Ordeño')
To detect fuel siphoning:
1. Driver starts a route via Telegram (`rutas.started_at`).
2. Bot requests a photo of the odometer and the text value (`odometros.tipo = 'inicio'`).
3. Driver finishes the route (`rutas.ended_at`).
4. Bot requests second photo/value (`odometros.tipo = 'fin'`).
5. The system calculates `Distance / Estimated Fuel Consumption`. Heavy discrepancies flag a "Warning" alert in the owner's dashboard.

#### Daily Fee Payments
- Each vehicle generates a record in `pagos_diarios` every day it enters a route.
- Drivers pay this fixed fee to the Owner.
- Status is tracked as `pendiente` or `pagado`.
