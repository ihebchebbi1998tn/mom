# Consultation Availability Setup

## Database Setup

1. Run the SQL script to create the table:
```sql
-- Execute this in your MySQL database
source api/consultation_availability_table.sql;
```

Or manually execute:
```sql
CREATE TABLE IF NOT EXISTS `consultation_availability` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL UNIQUE,
    `status` enum('available', 'full', 'unavailable') NOT NULL DEFAULT 'available',
    `notes` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## API Endpoints

### Base URL: `/api/consultation_availability.php`

#### GET - Retrieve availability
- **All records**: `GET /api/consultation_availability.php`
- **Specific date**: `GET /api/consultation_availability.php?date=2024-12-25`
- **Month view**: `GET /api/consultation_availability.php?month=12&year=2024`
- **Date range**: `GET /api/consultation_availability.php?range=true&start_date=2024-12-01&end_date=2024-12-31`

#### POST - Create/Update availability
```json
{
    "date": "2024-12-25",
    "status": "unavailable",
    "notes": "Holiday break"
}
```

#### PUT - Update existing record
```json
{
    "id": 1,
    "status": "available",
    "notes": "Back to normal schedule"
}
```

#### DELETE - Remove availability record
```json
{
    "id": 1
}
```

## Status Types
- `available` - Normal booking available
- `full` - All slots booked for this date
- `unavailable` - No consultations available (holidays, personal time, etc.)

## Admin Interface
Access the consultation availability management from:
- Admin Dashboard → Consultations Tab
- Add, edit, or delete availability dates
- Set custom notes for special dates

## Client Interface
- Calendar shows color-coded availability
- Red dates: Full (no more bookings)
- Gray dates: Unavailable (no consultations)
- Blue dates: Available for booking
- Past dates: Automatically disabled