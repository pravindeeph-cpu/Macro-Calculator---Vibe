// Built-in food/drink database. Macro values are per 100g (or 100ml for liquids).
// cals = kcal, protein/carbs/fat = grams. alcohol = grams of pure alcohol (only set on alcoholic drinks).
// servings (optional) = quick-pick preset sizes, e.g. [{ label: "Large can (500ml)", grams: 500 }].
// Composite dishes still use per-100g macros so the "Custom amount" option can scale a bigger or smaller plate.
const FOOD_DB = [
  // ---------------- Proteins ----------------
  { name: "Chicken breast, cooked", category: "Protein", cals: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Chicken thigh, cooked", category: "Protein", cals: 209, protein: 26, carbs: 0, fat: 10.9 },
  { name: "Ground beef, 85% lean, cooked", category: "Protein", cals: 250, protein: 26, carbs: 0, fat: 17 },
  { name: "Salmon, cooked", category: "Protein", cals: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Tuna, canned in water", category: "Protein", cals: 116, protein: 26, carbs: 0, fat: 1 },
  { name: "Shrimp, cooked", category: "Protein", cals: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { name: "Egg, whole", category: "Protein", cals: 155, protein: 13, carbs: 1.1, fat: 11, servings: [{ label: "1 large egg (50g)", grams: 50 }] },
  { name: "Egg white", category: "Protein", cals: 52, protein: 11, carbs: 0.7, fat: 0.2 },
  { name: "Tofu, firm", category: "Protein", cals: 144, protein: 15.5, carbs: 3.9, fat: 8.7 },
  { name: "Turkey breast, cooked", category: "Protein", cals: 135, protein: 30, carbs: 0, fat: 1 },
  { name: "Pork chop, cooked", category: "Protein", cals: 231, protein: 25, carbs: 0, fat: 14 },
  { name: "Bacon, cooked", category: "Protein", cals: 541, protein: 37, carbs: 1.4, fat: 42 },
  { name: "Greek yogurt, plain, nonfat", category: "Dairy", cals: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Cottage cheese, low-fat", category: "Dairy", cals: 72, protein: 12, carbs: 3, fat: 1 },
  { name: "Whey protein powder", category: "Protein", cals: 380, protein: 80, carbs: 8, fat: 5, servings: [{ label: "1 scoop (30g)", grams: 30 }] },

  // ---------------- Carbs / grains ----------------
  { name: "White rice, cooked", category: "Grain", cals: 130, protein: 2.7, carbs: 28, fat: 0.3, servings: [{ label: "1 cup (158g)", grams: 158 }] },
  { name: "Brown rice, cooked", category: "Grain", cals: 123, protein: 2.7, carbs: 26, fat: 0.9, servings: [{ label: "1 cup (195g)", grams: 195 }] },
  { name: "Quinoa, cooked", category: "Grain", cals: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: "Oats, dry", category: "Grain", cals: 389, protein: 17, carbs: 66, fat: 7, servings: [{ label: "1 packet (40g)", grams: 40 }] },
  { name: "Pasta, cooked", category: "Grain", cals: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: "Bread, white", category: "Grain", cals: 265, protein: 9, carbs: 49, fat: 3.2, servings: [{ label: "1 slice (30g)", grams: 30 }] },
  { name: "Bread, whole wheat", category: "Grain", cals: 247, protein: 13, carbs: 41, fat: 3.4, servings: [{ label: "1 slice (32g)", grams: 32 }] },
  { name: "Gardenia Buns", category: "Grain", cals: 290, protein: 8, carbs: 50, fat: 6, servings: [{ label: "1 bun (45g)", grams: 45 }] },
  { name: "Potato, baked", category: "Vegetable", cals: 93, protein: 2.5, carbs: 21, fat: 0.1, servings: [{ label: "1 medium potato (170g)", grams: 170 }] },
  { name: "Sweet potato, baked", category: "Vegetable", cals: 90, protein: 2, carbs: 21, fat: 0.1, servings: [{ label: "1 medium (130g)", grams: 130 }] },
  { name: "Tortilla, flour", category: "Grain", cals: 312, protein: 8.2, carbs: 51, fat: 8, servings: [{ label: "1 tortilla (45g)", grams: 45 }] },
  { name: "Bagel", category: "Grain", cals: 257, protein: 10, carbs: 50, fat: 1.5, servings: [{ label: "1 bagel (95g)", grams: 95 }] },
  { name: "Cereal, granola", category: "Grain", cals: 471, protein: 10, carbs: 64, fat: 20 },

  // ---------------- Fruit ----------------
  { name: "Banana", category: "Fruit", cals: 89, protein: 1.1, carbs: 23, fat: 0.3, servings: [{ label: "1 medium banana (120g)", grams: 120 }] },
  { name: "Apple", category: "Fruit", cals: 52, protein: 0.3, carbs: 14, fat: 0.2, servings: [{ label: "1 medium apple (180g)", grams: 180 }] },
  { name: "Orange", category: "Fruit", cals: 47, protein: 0.9, carbs: 12, fat: 0.1, servings: [{ label: "1 medium orange (130g)", grams: 130 }] },
  { name: "Strawberries", category: "Fruit", cals: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { name: "Blueberries", category: "Fruit", cals: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: "Grapes", category: "Fruit", cals: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { name: "Avocado", category: "Fruit", cals: 160, protein: 2, carbs: 8.5, fat: 14.7, servings: [{ label: "1/2 avocado (100g)", grams: 100 }] },
  { name: "Mango", category: "Fruit", cals: 60, protein: 0.8, carbs: 15, fat: 0.4 },

  // ---------------- Vegetables ----------------
  { name: "Broccoli, cooked", category: "Vegetable", cals: 35, protein: 2.4, carbs: 7.2, fat: 0.4 },
  { name: "Spinach, raw", category: "Vegetable", cals: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Carrot, raw", category: "Vegetable", cals: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: "Mixed salad greens", category: "Vegetable", cals: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: "Tomato", category: "Vegetable", cals: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: "Green beans, cooked", category: "Vegetable", cals: 35, protein: 1.8, carbs: 8, fat: 0.1 },
  { name: "Corn, cooked", category: "Vegetable", cals: 96, protein: 3.4, carbs: 21, fat: 1.5 },

  // ---------------- Nuts, fats, snacks ----------------
  { name: "Almonds", category: "Nuts/Fat", cals: 579, protein: 21, carbs: 22, fat: 50, servings: [{ label: "1 small handful (28g)", grams: 28 }] },
  { name: "Peanut butter", category: "Nuts/Fat", cals: 588, protein: 25, carbs: 20, fat: 50, servings: [{ label: "1 tbsp (16g)", grams: 16 }] },
  { name: "Olive oil", category: "Nuts/Fat", cals: 884, protein: 0, carbs: 0, fat: 100, servings: [{ label: "1 tbsp (14g)", grams: 14 }] },
  { name: "Butter", category: "Nuts/Fat", cals: 717, protein: 0.9, carbs: 0.1, fat: 81, servings: [{ label: "1 tbsp (14g)", grams: 14 }] },
  { name: "Cheddar cheese", category: "Dairy", cals: 403, protein: 25, carbs: 1.3, fat: 33, servings: [{ label: "1 slice (28g)", grams: 28 }] },
  { name: "Mozzarella cheese", category: "Dairy", cals: 280, protein: 28, carbs: 3.1, fat: 17 },
  { name: "Hummus", category: "Nuts/Fat", cals: 166, protein: 8, carbs: 14, fat: 9.6 },
  { name: "Dark chocolate", category: "Snack", cals: 546, protein: 4.9, carbs: 61, fat: 31 },
  { name: "Potato chips", category: "Snack", cals: 536, protein: 7, carbs: 53, fat: 35, servings: [{ label: "1 small bag (30g)", grams: 30 }] },
  { name: "Ice cream, vanilla", category: "Snack", cals: 207, protein: 3.5, carbs: 24, fat: 11, servings: [{ label: "1 scoop (65g)", grams: 65 }] },

  // ---------------- Drinks (per 100ml) ----------------
  {
    name: "Whole milk", category: "Drink", cals: 61, protein: 3.2, carbs: 4.8, fat: 3.3,
    servings: [{ label: "1 glass (250ml)", grams: 250 }],
  },
  { name: "Skim milk", category: "Drink", cals: 34, protein: 3.4, carbs: 5, fat: 0.1, servings: [{ label: "1 glass (250ml)", grams: 250 }] },
  { name: "Orange juice", category: "Drink", cals: 45, protein: 0.7, carbs: 10.4, fat: 0.2, servings: [{ label: "1 glass (250ml)", grams: 250 }] },
  {
    name: "Soda, cola", category: "Drink", cals: 42, protein: 0, carbs: 10.6, fat: 0,
    servings: [
      { label: "Can (330ml)", grams: 330 },
      { label: "Bottle (500ml)", grams: 500 },
    ],
  },
  {
    name: "Beer, regular", category: "Drink", cals: 43, protein: 0.5, carbs: 3.6, fat: 0, alcohol: 3.9,
    servings: [
      { label: "Small can/bottle (330ml)", grams: 330 },
      { label: "Large can (500ml)", grams: 500 },
      { label: "Pint (568ml)", grams: 568 },
    ],
  },
  {
    name: "Wine, red", category: "Drink", cals: 85, protein: 0.1, carbs: 2.6, fat: 0, alcohol: 9.5,
    servings: [
      { label: "Standard glass (150ml)", grams: 150 },
      { label: "Large glass (250ml)", grams: 250 },
    ],
  },
  {
    name: "Wine, white", category: "Drink", cals: 82, protein: 0.1, carbs: 2.6, fat: 0, alcohol: 9.5,
    servings: [
      { label: "Standard glass (150ml)", grams: 150 },
      { label: "Large glass (250ml)", grams: 250 },
    ],
  },
  {
    name: "Spirits, 40% ABV (vodka, whiskey, gin...)", category: "Drink", cals: 231, protein: 0, carbs: 0, fat: 0, alcohol: 31.6,
    servings: [
      { label: "Single shot (30ml)", grams: 30 },
      { label: "Double shot (60ml)", grams: 60 },
    ],
  },
  { name: "Black coffee", category: "Drink", cals: 1, protein: 0.1, carbs: 0, fat: 0, servings: [{ label: "1 cup (240ml)", grams: 240 }] },
  { name: "Coffee with milk & sugar", category: "Drink", cals: 30, protein: 1, carbs: 4, fat: 1, servings: [{ label: "1 cup (240ml)", grams: 240 }] },
  { name: "Coffee with milk, no sugar", category: "Drink", cals: 18, protein: 1, carbs: 1.8, fat: 1, servings: [{ label: "1 cup (240ml)", grams: 240 }] },
  {
    name: "Latte (milk, no sugar)", category: "Drink", cals: 45, protein: 2.5, carbs: 3.8, fat: 2.5,
    servings: [
      { label: "Small (240ml)", grams: 240 },
      { label: "Medium (350ml)", grams: 350 },
      { label: "Large (470ml)", grams: 470 },
    ],
  },
  { name: "Protein shake (milk-based)", category: "Drink", cals: 90, protein: 8, carbs: 8, fat: 3, servings: [{ label: "1 shaker (400ml)", grams: 400 }] },
  {
    name: "Sports drink (Gatorade-type)", category: "Drink", cals: 25, protein: 0, carbs: 6, fat: 0,
    servings: [
      { label: "Bottle (500ml)", grams: 500 },
      { label: "Bottle (600ml)", grams: 600 },
    ],
  },
  { name: "Almond milk, unsweetened", category: "Drink", cals: 13, protein: 0.5, carbs: 0.6, fat: 1.1, servings: [{ label: "1 glass (250ml)", grams: 250 }] },

  // ================= Composite dishes (whole meals in one entry) =================
  // Values are realistic per-100g estimates; each dish carries one default "plate/bowl"
  // serving so it can be logged in a single tap, with "Custom amount" still available to
  // adjust portion size in grams if needed.

  // ---------------- Malaysian ----------------
  { name: "Nasi Lemak (rice, sambal, egg, anchovies, peanuts)", category: "Malaysian", cals: 200, protein: 5, carbs: 24, fat: 9, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Chicken Rendang", category: "Malaysian", cals: 220, protein: 15, carbs: 5, fat: 16, servings: [{ label: "1 serving (200g)", grams: 200 }] },
  { name: "Char Kway Teow", category: "Malaysian", cals: 180, protein: 7, carbs: 22, fat: 7, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Curry Laksa", category: "Malaysian", cals: 110, protein: 5, carbs: 10, fat: 6, servings: [{ label: "1 bowl (500g)", grams: 500 }] },
  { name: "Chicken Satay with peanut sauce", category: "Malaysian", cals: 220, protein: 20, carbs: 8, fat: 13, servings: [{ label: "5 skewers (150g)", grams: 150 }] },
  { name: "Roti Canai with dhal", category: "Malaysian", cals: 300, protein: 6, carbs: 40, fat: 13, servings: [{ label: "1 piece with dhal (150g)", grams: 150 }] },
  { name: "Mee Goreng Mamak", category: "Malaysian", cals: 170, protein: 6, carbs: 22, fat: 7, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Nasi Goreng (Malaysian fried rice)", category: "Malaysian", cals: 190, protein: 6, carbs: 25, fat: 7, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Hainanese Chicken Rice", category: "Malaysian", cals: 180, protein: 9, carbs: 22, fat: 6, servings: [{ label: "1 plate (400g)", grams: 400 }] },
  { name: "Curry Mee", category: "Malaysian", cals: 130, protein: 6, carbs: 12, fat: 7, servings: [{ label: "1 bowl (450g)", grams: 450 }] },
  { name: "Bak Kut Teh (herbal pork rib soup)", category: "Malaysian", cals: 140, protein: 12, carbs: 3, fat: 9, servings: [{ label: "1 bowl (400g)", grams: 400 }] },
  { name: "Roti Telur (egg roti)", category: "Malaysian", cals: 280, protein: 8, carbs: 32, fat: 13, servings: [{ label: "1 piece (120g)", grams: 120 }] },

  // ---------------- Indian ----------------
  { name: "Chicken Biryani", category: "Indian", cals: 165, protein: 9, carbs: 20, fat: 5, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Vegetable Biryani", category: "Indian", cals: 150, protein: 4, carbs: 24, fat: 4.5, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Butter Chicken (Murgh Makhani)", category: "Indian", cals: 190, protein: 14, carbs: 6, fat: 12, servings: [{ label: "1 serving (250g)", grams: 250 }] },
  { name: "Chana Masala", category: "Indian", cals: 130, protein: 6, carbs: 18, fat: 4, servings: [{ label: "1 bowl (250g)", grams: 250 }] },
  { name: "Palak Paneer", category: "Indian", cals: 150, protein: 7, carbs: 6, fat: 11, servings: [{ label: "1 bowl (250g)", grams: 250 }] },
  { name: "Dal Tadka", category: "Indian", cals: 100, protein: 6, carbs: 14, fat: 2.5, servings: [{ label: "1 bowl (250g)", grams: 250 }] },
  { name: "Chicken Tikka Masala", category: "Indian", cals: 180, protein: 15, carbs: 6, fat: 11, servings: [{ label: "1 serving (250g)", grams: 250 }] },
  { name: "Samosa", category: "Indian", cals: 260, protein: 5, carbs: 28, fat: 14, servings: [{ label: "2 pieces (120g)", grams: 120 }] },
  { name: "Naan Bread", category: "Indian", cals: 310, protein: 9, carbs: 50, fat: 8, servings: [{ label: "1 piece (90g)", grams: 90 }] },
  { name: "Masala Dosa", category: "Indian", cals: 170, protein: 4, carbs: 25, fat: 6, servings: [{ label: "1 dosa (200g)", grams: 200 }] },
  { name: "Idli & Sambar", category: "Indian", cals: 110, protein: 4, carbs: 20, fat: 1.5, servings: [{ label: "3 idli + sambar (300g)", grams: 300 }] },
  { name: "Chicken Curry", category: "Indian", cals: 165, protein: 14, carbs: 5, fat: 10, servings: [{ label: "1 serving (250g)", grams: 250 }] },
  { name: "Tandoori Chicken", category: "Indian", cals: 165, protein: 25, carbs: 2, fat: 6, servings: [{ label: "2 pieces (200g)", grams: 200 }] },
  { name: "Aloo Gobi", category: "Indian", cals: 110, protein: 3, carbs: 14, fat: 5, servings: [{ label: "1 bowl (250g)", grams: 250 }] },

  // ---------------- Chinese ----------------
  { name: "Kung Pao Chicken", category: "Chinese", cals: 170, protein: 13, carbs: 8, fat: 10, servings: [{ label: "1 serving (250g)", grams: 250 }] },
  { name: "Sweet and Sour Pork", category: "Chinese", cals: 200, protein: 10, carbs: 20, fat: 9, servings: [{ label: "1 serving (250g)", grams: 250 }] },
  { name: "Mapo Tofu", category: "Chinese", cals: 120, protein: 8, carbs: 4, fat: 8, servings: [{ label: "1 bowl (250g)", grams: 250 }] },
  { name: "Chinese Fried Rice", category: "Chinese", cals: 175, protein: 5, carbs: 25, fat: 6, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Chow Mein", category: "Chinese", cals: 150, protein: 6, carbs: 20, fat: 5, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Steamed Pork Dumplings", category: "Chinese", cals: 220, protein: 9, carbs: 22, fat: 10, servings: [{ label: "4 pieces (150g)", grams: 150 }] },
  { name: "Char Siu (BBQ Pork)", category: "Chinese", cals: 220, protein: 20, carbs: 10, fat: 11, servings: [{ label: "1 serving (150g)", grams: 150 }] },
  { name: "Wonton Soup", category: "Chinese", cals: 60, protein: 4, carbs: 6, fat: 2, servings: [{ label: "1 bowl (400g)", grams: 400 }] },
  { name: "General Tso's Chicken", category: "Chinese", cals: 220, protein: 12, carbs: 20, fat: 11, servings: [{ label: "1 serving (250g)", grams: 250 }] },
  { name: "Egg Fried Noodles", category: "Chinese", cals: 160, protein: 5, carbs: 24, fat: 5, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Hot and Sour Soup", category: "Chinese", cals: 45, protein: 3, carbs: 5, fat: 1.5, servings: [{ label: "1 bowl (350g)", grams: 350 }] },
  { name: "Peking Duck with pancakes", category: "Chinese", cals: 280, protein: 16, carbs: 15, fat: 18, servings: [{ label: "3 pancakes (200g)", grams: 200 }] },

  // ---------------- Italian ----------------
  { name: "Spaghetti Bolognese", category: "Italian", cals: 140, protein: 7, carbs: 16, fat: 5, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Margherita Pizza", category: "Italian", cals: 250, protein: 10, carbs: 30, fat: 9, servings: [{ label: "2 slices (200g)", grams: 200 }] },
  { name: "Pepperoni Pizza", category: "Italian", cals: 280, protein: 12, carbs: 28, fat: 13, servings: [{ label: "2 slices (200g)", grams: 200 }] },
  { name: "Lasagna", category: "Italian", cals: 150, protein: 9, carbs: 12, fat: 8, servings: [{ label: "1 slice (300g)", grams: 300 }] },
  { name: "Fettuccine Alfredo", category: "Italian", cals: 190, protein: 6, carbs: 18, fat: 11, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Chicken Parmesan", category: "Italian", cals: 200, protein: 16, carbs: 10, fat: 10, servings: [{ label: "1 serving (300g)", grams: 300 }] },
  { name: "Mushroom Risotto", category: "Italian", cals: 130, protein: 3, carbs: 18, fat: 5, servings: [{ label: "1 bowl (300g)", grams: 300 }] },
  { name: "Caprese Salad", category: "Italian", cals: 150, protein: 8, carbs: 4, fat: 12, servings: [{ label: "1 serving (200g)", grams: 200 }] },
  { name: "Minestrone Soup", category: "Italian", cals: 55, protein: 2.5, carbs: 9, fat: 1.3, servings: [{ label: "1 bowl (350g)", grams: 350 }] },
  { name: "Tiramisu", category: "Italian", cals: 290, protein: 5, carbs: 29, fat: 17, servings: [{ label: "1 slice (120g)", grams: 120 }] },
  { name: "Spaghetti Carbonara", category: "Italian", cals: 190, protein: 8, carbs: 17, fat: 10, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Bruschetta", category: "Italian", cals: 180, protein: 4, carbs: 24, fat: 7, servings: [{ label: "3 pieces (100g)", grams: 100 }] },

  // ---------------- Fast food ----------------
  { name: "Hamburger, fast food", category: "Fast Food", cals: 295, protein: 17, carbs: 25, fat: 14, servings: [{ label: "1 burger (170g)", grams: 170 }] },
  { name: "Cheeseburger", category: "Fast Food", cals: 290, protein: 14, carbs: 26, fat: 15, servings: [{ label: "1 burger (170g)", grams: 170 }] },
  { name: "French fries", category: "Fast Food", cals: 312, protein: 3.4, carbs: 41, fat: 15, servings: [{ label: "Medium serving (115g)", grams: 115 }] },
  { name: "Chicken Nuggets", category: "Fast Food", cals: 300, protein: 15, carbs: 17, fat: 19, servings: [{ label: "6 pieces (110g)", grams: 110 }] },
  { name: "Fried Chicken", category: "Fast Food", cals: 260, protein: 20, carbs: 10, fat: 16, servings: [{ label: "2 pieces (200g)", grams: 200 }] },
  { name: "Grilled Chicken Burger", category: "Fast Food", cals: 220, protein: 17, carbs: 22, fat: 7, servings: [{ label: "1 burger (200g)", grams: 200 }] },
  { name: "Hot Dog", category: "Fast Food", cals: 260, protein: 10, carbs: 20, fat: 16, servings: [{ label: "1 hot dog (100g)", grams: 100 }] },
  { name: "Onion Rings", category: "Fast Food", cals: 330, protein: 4, carbs: 38, fat: 18, servings: [{ label: "1 serving (100g)", grams: 100 }] },
  { name: "Beef Taco, hard shell", category: "Fast Food", cals: 230, protein: 11, carbs: 18, fat: 13, servings: [{ label: "2 tacos (170g)", grams: 170 }] },
  { name: "Beef Burrito", category: "Fast Food", cals: 200, protein: 9, carbs: 24, fat: 8, servings: [{ label: "1 burrito (300g)", grams: 300 }] },
  { name: "Fried Fish Sandwich", category: "Fast Food", cals: 250, protein: 10, carbs: 28, fat: 11, servings: [{ label: "1 sandwich (170g)", grams: 170 }] },
  { name: "Milkshake", category: "Fast Food", cals: 130, protein: 3, carbs: 21, fat: 4, servings: [{ label: "1 medium (400ml)", grams: 400 }] },

  // ---------------- Mexican ----------------
  { name: "Chicken Quesadilla", category: "Mexican", cals: 260, protein: 14, carbs: 20, fat: 14, servings: [{ label: "1 quesadilla (200g)", grams: 200 }] },
  { name: "Guacamole", category: "Mexican", cals: 150, protein: 2, carbs: 9, fat: 13, servings: [{ label: "1 serving (100g)", grams: 100 }] },
  { name: "Beef Enchiladas", category: "Mexican", cals: 190, protein: 9, carbs: 16, fat: 10, servings: [{ label: "2 enchiladas (300g)", grams: 300 }] },
  { name: "Nachos with cheese", category: "Mexican", cals: 300, protein: 8, carbs: 28, fat: 18, servings: [{ label: "1 serving (200g)", grams: 200 }] },
  { name: "Chili con Carne", category: "Mexican", cals: 140, protein: 10, carbs: 10, fat: 6, servings: [{ label: "1 bowl (300g)", grams: 300 }] },

  // ---------------- Thai ----------------
  { name: "Pad Thai", category: "Thai", cals: 180, protein: 7, carbs: 24, fat: 6, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Thai Green Curry with chicken", category: "Thai", cals: 150, protein: 9, carbs: 6, fat: 10, servings: [{ label: "1 serving (300g)", grams: 300 }] },
  { name: "Tom Yum Soup", category: "Thai", cals: 45, protein: 4, carbs: 4, fat: 1.5, servings: [{ label: "1 bowl (350g)", grams: 350 }] },
  { name: "Thai Fried Rice", category: "Thai", cals: 170, protein: 5, carbs: 24, fat: 6, servings: [{ label: "1 plate (300g)", grams: 300 }] },
  { name: "Massaman Curry", category: "Thai", cals: 160, protein: 9, carbs: 8, fat: 10, servings: [{ label: "1 serving (300g)", grams: 300 }] },

  // ---------------- Japanese ----------------
  { name: "Chicken Katsu with rice", category: "Japanese", cals: 210, protein: 10, carbs: 22, fat: 9, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "California Roll Sushi", category: "Japanese", cals: 150, protein: 5, carbs: 25, fat: 3, servings: [{ label: "8 pieces (200g)", grams: 200 }] },
  { name: "Tonkotsu Ramen", category: "Japanese", cals: 110, protein: 5, carbs: 12, fat: 4.5, servings: [{ label: "1 bowl (500g)", grams: 500 }] },
  { name: "Teriyaki Chicken with rice", category: "Japanese", cals: 175, protein: 11, carbs: 20, fat: 5, servings: [{ label: "1 plate (350g)", grams: 350 }] },
  { name: "Miso Soup", category: "Japanese", cals: 25, protein: 2, carbs: 3, fat: 1, servings: [{ label: "1 bowl (250g)", grams: 250 }] },
  { name: "Mixed Tempura", category: "Japanese", cals: 220, protein: 6, carbs: 20, fat: 13, servings: [{ label: "6 pieces (150g)", grams: 150 }] },

  // ---------------- Middle Eastern ----------------
  { name: "Chicken Shawarma Wrap", category: "Middle Eastern", cals: 210, protein: 14, carbs: 18, fat: 9, servings: [{ label: "1 wrap (280g)", grams: 280 }] },
  { name: "Falafel", category: "Middle Eastern", cals: 330, protein: 13, carbs: 32, fat: 17, servings: [{ label: "5 pieces (120g)", grams: 120 }] },
  { name: "Baba Ganoush", category: "Middle Eastern", cals: 130, protein: 3, carbs: 8, fat: 10, servings: [{ label: "1 serving (100g)", grams: 100 }] },
  { name: "Lamb Kebab", category: "Middle Eastern", cals: 230, protein: 21, carbs: 2, fat: 15, servings: [{ label: "1 serving (200g)", grams: 200 }] },
  { name: "Tabbouleh", category: "Middle Eastern", cals: 90, protein: 2, carbs: 11, fat: 4.5, servings: [{ label: "1 serving (150g)", grams: 150 }] },
];
