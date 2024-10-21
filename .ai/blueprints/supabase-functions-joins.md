Here is the documentation from the Supabase page on querying joins and nested tables:

## Querying Joins and Nested Tables

The data APIs automatically detect relationships between Postgres tables. Since Postgres is a relational database, this is a very common scenario.

### One-to-Many Joins

Let's use an example database that stores `countries` and `cities`:

**Countries**

| `id` | `name`           |
|------|------------------|
| 1    | United Kingdom    |
| 2    | United States     |

**Cities**

| `id` | `name`       | `country_id` |
|------|--------------|---------------|
| 1    | London       | 1             |
| 2    | Manchester   | 1             |
| 3    | Los Angeles  | 2             |
| 4    | New York     | 2             |

The APIs will automatically detect relationships based on the foreign keys:

```javascript
const { data, error } = await supabase
  .from('countries')
  .select(`
    id,
    name,
    cities ( id, name )
  `);
```

### TypeScript Types for Joins

`supabase-js` always returns a `data` object (for success) and an `error` object (for unsuccessful requests). These helper types provide the result types from any query, including nested types for database joins.

Given the following schema with a relation between cities and countries:

```sql
create table countries (
  "id" serial primary key,
  "name" text
);
create table cities (
  "id" serial primary key,
  "name" text,
  "country_id" int references "countries"
);
```

We can get the nested `CountriesWithCities` type like this:

```javascript
import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js';

const countriesWithCitiesQuery = supabase
  .from('countries')
  .select(`
    id,
    name,
    cities ( id, name )
  `);

type CountriesWithCities = QueryData<typeof countriesWithCitiesQuery>;

const { data, error } = await countriesWithCitiesQuery;
if (error) throw error;
const countriesWithCities: CountriesWithCities = data;
```

### Many-to-Many Joins

The data APIs will detect many-to-many joins. For example, if you have a database that stores teams of users (where each user could belong to many teams):

```sql
create table users (
  "id" serial primary key,
  "name" text
);
create table teams (
  "id" serial primary key,
  "team_name" text
);
create table members (
  "user_id" int references users,
  "team_id" int references teams,
  primary key (user_id, team_id)
);
```

In these cases, you don't need to explicitly define the joining table (`members`). If we wanted to fetch all the teams and the members in each team:

```javascript
const { data, error } = await supabase
  .from('teams')
  .select(`
    id,
    team_name,
    users ( id, name )
  `);
```

### Specifying the `ON` Clause for Joins with Multiple Foreign Keys

For example, if you have a project that tracks when employees check in and out of work shifts:

```sql
-- Employees
create table users (
  "id" serial primary key,
  "name" text
);

-- Badge scans
create table scans (
  "id" serial primary key,
  "user_id" int references users,
  "badge_scan_time" timestamp
);

-- Work shifts
create table shifts (
  "id" serial primary key,
  "user_id" int references users,
  "scan_id_start" int references scans, -- clocking in
  "scan_id_end" int references scans, -- clocking out
  "attendance_status" text
);
```

In this case, you need to explicitly define the join because the joining column on `shifts` is ambiguous as they are both referencing the `scans` table.

To fetch all the shifts with `scan_id_start` and `scan_id_end` related to a specific scan, use the following syntax:

```javascript
const { data, error } = await supabase
  .from('shifts')
  .select(`
    *,
    start_scan:scans!scan_id_start ( id, user_id, badge_scan_time ),
    end_scan:scans!scan_id_end ( id, user_id, badge_scan_time )
  `);
```

This documentation provides a comprehensive overview of how to perform joins and manage nested queries in Supabase.

Citations:
[1] https://supabase.com/docs/guides/database/joins-and-nesting