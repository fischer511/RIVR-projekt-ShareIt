# Shema podatkovne baze

Aplikacija uporablja Firebase Firestore kot NoSQL podatkovno bazo.

## Kolekcije in polja

### users
- userId (string, UID)
- email (string)
- displayName (string)
- profileImageUrl (string)
- phoneNumber (string, opcijsko)
- location (object: latitude, longitude, address)
- createdAt (timestamp)
- updatedAt (timestamp)
- rating (number)
- ratingCount (number)
- totalRentals (number)
- totalListings (number)

### items
- itemId (string)
- ownerId (string, referenca na users)
- title (string)
- description (string)
- category (string)
- images (array[string])
- pricePerDay (number)
- location (object: latitude, longitude, address)
- availability (object: isAvailable, unavailableDates[])
- condition (string)
- createdAt (timestamp)
- updatedAt (timestamp)
- views (number)
- totalRentals (number)
- rating (number)
- ratingCount (number)
- isActive (boolean)

### rentals
- rentalId (string)
- itemId (string, referenca na items)
- itemTitle (string)
- itemImageUrl (string)
- renterId (string, referenca na users)
- renterName (string)
- ownerId (string, referenca na users)
- ownerName (string)
- startDate (timestamp)
- endDate (timestamp)
- status (string: pending, confirmed, active, completed, cancelled, rejected)
- totalPrice (number)
- message (string)
- createdAt (timestamp)
- updatedAt (timestamp)
- confirmedAt (timestamp)
- completedAt (timestamp)
- cancelledAt (timestamp)
- rating (object: fromRenter, fromOwner)

### notifications
- notificationId (string)
- userId (string)
- type (string)
- title (string)
- body (string)
- data (object: rentalId, itemId, senderId)
- isRead (boolean)
- createdAt (timestamp)
- readAt (timestamp)

## Relacije
- users (1) --- (N) items
- users (1) --- (N) rentals
- items (1) --- (N) rentals
- users (1) --- (N) notifications

## Varnost
- Uporabniki lahko berejo in pišejo samo svoj profil
- Predmeti so javno berljivi, lastnik lahko ureja
- Izposoje lahko vidijo samo udeleženci
- Obvestila lahko vidi samo prejemnik
