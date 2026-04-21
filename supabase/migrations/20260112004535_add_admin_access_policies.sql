/*
  # Add Admin Access Policies

  1. Purpose
    - Grant administrative users full access to all tables
    - Allow admins to view, edit, and manage all user data for support purposes
  
  2. Changes
    - Add admin policies to all tables requiring admin access
  
  3. Security
    - Policies check for is_admin = true in the profiles table
    - Admins have full SELECT, INSERT, UPDATE, DELETE access
    - Regular users maintain their existing restricted access
  
  4. Notes
    - Admin access is for customer support purposes
    - All admin actions should be logged and auditable
*/

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles table admin policies
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Agreements table admin policies
CREATE POLICY "Admins can view all agreements"
  ON agreements FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all agreements"
  ON agreements FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert agreements"
  ON agreements FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete agreements"
  ON agreements FOR DELETE
  TO authenticated
  USING (is_admin());

-- Children table admin policies
CREATE POLICY "Admins can view all children"
  ON children FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all children"
  ON children FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete children"
  ON children FOR DELETE
  TO authenticated
  USING (is_admin());

-- Property items admin policies
CREATE POLICY "Admins can view all property items"
  ON property_items FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all property items"
  ON property_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert property items"
  ON property_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete property items"
  ON property_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- Support calculations admin policies
CREATE POLICY "Admins can view all support calculations"
  ON support_calculations FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all support calculations"
  ON support_calculations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert support calculations"
  ON support_calculations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete support calculations"
  ON support_calculations FOR DELETE
  TO authenticated
  USING (is_admin());

-- Parenting schedules admin policies
CREATE POLICY "Admins can view all parenting schedules"
  ON parenting_schedules FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all parenting schedules"
  ON parenting_schedules FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert parenting schedules"
  ON parenting_schedules FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete parenting schedules"
  ON parenting_schedules FOR DELETE
  TO authenticated
  USING (is_admin());

-- Parenting terms admin policies
CREATE POLICY "Admins can view all parenting terms"
  ON parenting_terms FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all parenting terms"
  ON parenting_terms FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert parenting terms"
  ON parenting_terms FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete parenting terms"
  ON parenting_terms FOR DELETE
  TO authenticated
  USING (is_admin());

-- Property division terms admin policies
CREATE POLICY "Admins can view all property division terms"
  ON property_division_terms FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all property division terms"
  ON property_division_terms FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert property division terms"
  ON property_division_terms FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete property division terms"
  ON property_division_terms FOR DELETE
  TO authenticated
  USING (is_admin());

-- Section7 expenses admin policies
CREATE POLICY "Admins can view all section7 expenses"
  ON section7_expenses FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all section7 expenses"
  ON section7_expenses FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert section7 expenses"
  ON section7_expenses FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete section7 expenses"
  ON section7_expenses FOR DELETE
  TO authenticated
  USING (is_admin());

-- Special clauses admin policies
CREATE POLICY "Admins can view all special clauses"
  ON special_clauses FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all special clauses"
  ON special_clauses FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert special clauses"
  ON special_clauses FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete special clauses"
  ON special_clauses FOR DELETE
  TO authenticated
  USING (is_admin());

-- Retroactive support periods admin policies
CREATE POLICY "Admins can view all retroactive support periods"
  ON retroactive_support_periods FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all retroactive support periods"
  ON retroactive_support_periods FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert retroactive support periods"
  ON retroactive_support_periods FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete retroactive support periods"
  ON retroactive_support_periods FOR DELETE
  TO authenticated
  USING (is_admin());

-- Previous relationship children admin policies
CREATE POLICY "Admins can view all previous relationship children"
  ON previous_relationship_children FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all previous relationship children"
  ON previous_relationship_children FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert previous relationship children"
  ON previous_relationship_children FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete previous relationship children"
  ON previous_relationship_children FOR DELETE
  TO authenticated
  USING (is_admin());