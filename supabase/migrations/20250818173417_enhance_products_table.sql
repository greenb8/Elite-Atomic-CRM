-- Add new columns to the products table for vendor, size, and quantity tracking
ALTER TABLE "public"."products" 
    ADD COLUMN "vendor" text,
    ADD COLUMN "size" text,
    ADD COLUMN "quantity_on_hand" integer NOT NULL DEFAULT 0,
    ADD COLUMN "quantity_sold" integer NOT NULL DEFAULT 0;

-- Create an index on vendor for faster lookups
CREATE INDEX idx_products_vendor ON "public"."products" ("vendor");

-- Create a view for product inventory summary
CREATE VIEW "public"."products_inventory_summary"
    WITH (security_invoker=on)
    AS
SELECT 
    p.*,
    COALESCE(SUM(dli.quantity), 0) as total_sold_in_deals
FROM 
    "public"."products" p
LEFT JOIN 
    "public"."deal_line_items" dli ON p.id = dli.product_id
LEFT JOIN
    "public"."deals" d ON dli.deal_id = d.id AND d.stage = 'won'
GROUP BY 
    p.id;
