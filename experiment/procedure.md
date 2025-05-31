### Procedure

1. **Input Pipe Diameter:**
   In the “Input Parameters” section, enter the **pipe diameter** in meters (within the range 0.1–1.0 m).
   Example: `0.05` m.

2. **Input Flow Velocity:**
   Enter the **flow velocity** of the fluid in m/s (between 0.1–10 m/s).
   Example: `1.5` m/s.

3. **Select Fluid Type:**
   Choose the **fluid type** from the dropdown menu.
   Example: `Water`.
   *(The simulator will use appropriate fluid properties like density and viscosity based on selection.)*

4. **Click "Calculate Reynolds Number":**
   Press the **blue button** labeled `Calculate Reynolds Number`.
   This will compute the Reynolds number based on the formula:

   $$
   Re = \frac{{\rho \cdot u \cdot D}}{\mu} = \frac{uD}{\nu}
   $$

   where:

   * $u$ = velocity
   * $D$ = diameter
   * $\nu$ = kinematic viscosity

5. **Observe Results:**
   The calculated **Reynolds number** and **Flow Type** (Laminar, Transitional, or Turbulent) will appear in the **Results** box on the right.

6. **Record the Data:**
   If required, click the **“Record Data”** button to save the calculated data point. This can be used to collect multiple observations.

7. **Export Data:**
   Once all desired readings are recorded, click **“Export to PDF”** to save your results.

8. **Flow Visualization (if applicable):**
   Below the interface, the **Flow Visualization** area will graphically show how the fluid behaves for the entered conditions.

   * Smooth line → Laminar
   * Disturbed, wavy pattern → Transitional
   * Chaotic, mixed pattern → Turbulent

9. **Reset for New Inputs:**
    To perform another trial, click the **red “Reset”** button, and repeat the above steps with different values.

