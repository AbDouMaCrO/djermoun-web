alter table cars
  add column if not exists paint_condition text check (
    paint_condition in ('original_paint', 'with_paint_minor_accident')
  );
