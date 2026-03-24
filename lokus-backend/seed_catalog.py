from sqlalchemy import create_engine, Column, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Connect to your team's SQLite database
DATABASE_URL = "sqlite:///./lokus_state_engine.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Define the exact schema your team built
class StaticShoe(Base):
    __tablename__ = "shoes"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    color = Column(String)
    material = Column(String)
    closure = Column(String)
    heel = Column(String)
    water_resistance = Column(String)
    sole_material = Column(String)
    style = Column(String)
    manufacturer = Column(String)
    front_img = Column(String)
    back_img = Column(String)
    side_img = Column(String)
    top_img = Column(String)

# Create table if it doesn't exist
Base.metadata.create_all(bind=engine)

# 3. The MASSIVE Data Payload (Extracted from your team's .db file)
shoe_data = [
    # --- NEW BALANCE ---
    {
        "id": "New_Balance_9060", "name": "New Balance 9060", "price": 14999, "color": "Sea Salt", 
        "material": "Suede/Mesh", "closure": "Laces", "heel": "Chunky", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Chunky", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_9060\image_1.jpg", "back_img": r"images\New_Balance_9060\image_2.jpg", 
        "side_img": r"images\New_Balance_9060\image_3.jpg", "top_img": r"images\New_Balance_9060\image_4.jpg"
    },
    {
        "id": "New_Balance_2002R", "name": "New Balance 2002R", "price": 13999, "color": "Protection Pack Grey", 
        "material": "Suede/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_2002R\image_1.jpg", "back_img": r"images\New_Balance_2002R\image_2.jpg", 
        "side_img": r"images\New_Balance_2002R\image_3.jpg", "top_img": r"images\New_Balance_2002R\image_4.jpg"
    },
    {
        "id": "New_Balance_530", "name": "New Balance 530", "price": 8999, "color": "Silver/Navy", 
        "material": "Mesh/Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Dad Shoe", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_530\image_1.jpg", "back_img": r"images\New_Balance_530\image_2.jpg", 
        "side_img": r"images\New_Balance_530\image_3.jpg", "top_img": r"images\New_Balance_530\image_4.jpg"
    },
    {
        "id": "New_Balance_990v6", "name": "New Balance 990v6", "price": 19999, "color": "Grey", 
        "material": "Pigskin/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_990v6\image_1.jpg", "back_img": r"images\New_Balance_990v6\image_2.jpg", 
        "side_img": r"images\New_Balance_990v6\image_3.jpg", "top_img": r"images\New_Balance_990v6\image_4.jpg"
    },
    {
        "id": "New_Balance_RC_Elite_v4", "name": "New Balance RC Elite v4", "price": 22999, "color": "White/Victory Blue", 
        "material": "Carbon/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Racing", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_RC_Elite_v4\image_1.jpg", "back_img": r"images\New_Balance_RC_Elite_v4\image_2.jpg", 
        "side_img": r"images\New_Balance_RC_Elite_v4\image_3.jpg", "top_img": r"images\New_Balance_RC_Elite_v4\image_4.jpg"
    },
    {
        "id": "New_Balance_Hierro_v8", "name": "New Balance Hierro v8", "price": 14999, "color": "Golden Hour", 
        "material": "Mesh/Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Vibram", "style": "Trail", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_Hierro_v8\image_1.jpg", "back_img": r"images\New_Balance_Hierro_v8\image_2.jpg", 
        "side_img": r"images\New_Balance_Hierro_v8\image_3.jpg", "top_img": r"images\New_Balance_Hierro_v8\image_4.jpg"
    },
    {
        "id": "New_Balance_860v13", "name": "New Balance 860v13", "price": 13999, "color": "Blue/Black", 
        "material": "Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_860v13\image_1.jpg", "back_img": r"images\New_Balance_860v13\image_2.jpg", 
        "side_img": r"images\New_Balance_860v13\image_3.jpg", "top_img": r"images\New_Balance_860v13\image_4.jpg"
    },
    {
        "id": "New_Balance_327", "name": "New Balance 327", "price": 9999, "color": "Moonbeam", 
        "material": "Suede/Nylon", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Retro", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_327\image_1.jpg", "back_img": r"images\New_Balance_327\image_2.jpg", 
        "side_img": r"images\New_Balance_327\image_3.jpg", "top_img": r"images\New_Balance_327\image_4.jpg"
    },
    {
        "id": "New_Balance_Fresh_Foam_1080", "name": "New Balance Fresh Foam 1080", "price": 15999, "color": "Starlight", 
        "material": "Engineered Knit", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_Fresh_Foam_1080\image_1.jpg", "back_img": r"images\New_Balance_Fresh_Foam_1080\image_2.jpg", 
        "side_img": r"images\New_Balance_Fresh_Foam_1080\image_3.jpg", "top_img": r"images\New_Balance_Fresh_Foam_1080\image_4.jpg"
    },
    {
        "id": "New_Balance_574", "name": "New Balance 574", "price": 7999, "color": "Classic Navy", 
        "material": "Suede/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_574\image_1.jpg", "back_img": r"images\New_Balance_574\image_2.jpg", 
        "side_img": r"images\New_Balance_574\image_3.jpg", "top_img": r"images\New_Balance_574\image_4.jpg"
    },
    {
        "id": "New_Balance_1906R", "name": "New Balance 1906R", "price": 14999, "color": "Silver Metallic", 
        "material": "Synthetic/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Tech-Runner", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_1906R\image_1.jpg", "back_img": r"images\New_Balance_1906R\image_2.jpg", 
        "side_img": r"images\New_Balance_1906R\image_3.jpg", "top_img": r"images\New_Balance_1906R\image_4.jpg"
    },
    {
        "id": "New_Balance_442_V2", "name": "New Balance 442 V2", "price": 11999, "color": "Black/White", 
        "material": "Kangaroo Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Football", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_442_V2\image_1.jpg", "back_img": r"images\New_Balance_442_V2\image_2.jpg", 
        "side_img": r"images\New_Balance_442_V2\image_3.jpg", "top_img": r"images\New_Balance_442_V2\image_4.jpg"
    },
    {
        "id": "New_Balance_1500", "name": "New Balance 1500", "price": 18999, "color": "Made in UK Navy", 
        "material": "Leather/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Classic", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_1500\image_1.jpg", "back_img": r"images\New_Balance_1500\image_2.jpg", 
        "side_img": r"images\New_Balance_1500\image_3.jpg", "top_img": r"images\New_Balance_1500\image_4.jpg"
    },
    {
        "id": "New_Balance_480", "name": "New Balance 480", "price": 8999, "color": "White/Green", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Skateboarding", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_480\image_1.jpg", "back_img": r"images\New_Balance_480\image_2.jpg", 
        "side_img": r"images\New_Balance_480\image_3.jpg", "top_img": r"images\New_Balance_480\image_4.jpg"
    },
    {
        "id": "New_Balance_1000", "name": "New Balance 1000", "price": 12999, "color": "Silver/Black", 
        "material": "Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "New Balance",
        "front_img": r"images\New_Balance_1000\image_1.jpg", "back_img": r"images\New_Balance_1000\image_2.jpg", 
        "side_img": r"images\New_Balance_1000\image_3.jpg", "top_img": r"images\New_Balance_1000\image_4.jpg"
    },

    # --- ADIDAS ---
    {
        "id": "Adidas_Spezial", "name": "Adidas Spezial", "price": 9999, "color": "Handball Blue", 
        "material": "Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Classic", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Spezial\image_1.jpg", "back_img": r"images\Adidas_Spezial\image_2.jpg", 
        "side_img": r"images\Adidas_Spezial\image_3.jpg", "top_img": r"images\Adidas_Spezial\image_4.jpg"
    },
    {
        "id": "Adidas_Ultraboost_Light", "name": "Adidas Ultraboost Light", "price": 16999, "color": "Core Black", 
        "material": "Primeknit", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Continental Rubber", "style": "Running", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Ultraboost_Light\image_1.jpg", "back_img": r"images\Adidas_Ultraboost_Light\image_2.jpg", 
        "side_img": r"images\Adidas_Ultraboost_Light\image_3.jpg", "top_img": r"images\Adidas_Ultraboost_Light\image_4.jpg"
    },
    {
        "id": "Adidas_Gazelle", "name": "Adidas Gazelle", "price": 8999, "color": "Navy/White", 
        "material": "Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Retro", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Gazelle\image_1.jpg", "back_img": r"images\Adidas_Gazelle\image_2.jpg", 
        "side_img": r"images\Adidas_Gazelle\image_3.jpg", "top_img": r"images\Adidas_Gazelle\image_4.jpg"
    },
    {
        "id": "Adidas_Samba_OG", "name": "Adidas Samba OG", "price": 10999, "color": "Black/White", 
        "material": "Leather/Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Classic", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Samba_OG\image_1.jpg", "back_img": r"images\Adidas_Samba_OG\image_2.jpg", 
        "side_img": r"images\Adidas_Samba_OG\image_3.jpg", "top_img": r"images\Adidas_Samba_OG\image_4.jpg"
    },
    {
        "id": "Adidas_Gazelle_Indoor", "name": "Adidas Gazelle Indoor", "price": 11999, "color": "Blue/Gum", 
        "material": "Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Terrace", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Gazelle_Indoor\image_1.jpg", "back_img": r"images\Adidas_Gazelle_Indoor\image_2.jpg", 
        "side_img": r"images\Adidas_Gazelle_Indoor\image_3.jpg", "top_img": r"images\Adidas_Gazelle_Indoor\image_4.jpg"
    },
    {
        "id": "Adidas_Forum_Low", "name": "Adidas Forum Low", "price": 9999, "color": "White/Royal Blue", 
        "material": "Leather", "closure": "Velcro/Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Basketball", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Forum_Low\image_1.jpg", "back_img": r"images\Adidas_Forum_Low\image_2.jpg", 
        "side_img": r"images\Adidas_Forum_Low\image_3.jpg", "top_img": r"images\Adidas_Forum_Low\image_4.jpg"
    },
    {
        "id": "Adidas_Terrex_Free_Hiker", "name": "Adidas Terrex Free Hiker", "price": 18999, "color": "Black/Grey", 
        "material": "Gore-Tex/Knit", "closure": "Laces", "heel": "Flat", "water_resistance": "Waterproof", 
        "sole_material": "Continental Rubber", "style": "Outdoor", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Terrex_Free_Hiker\image_1.jpg", "back_img": r"images\Adidas_Terrex_Free_Hiker\image_2.jpg", 
        "side_img": r"images\Adidas_Terrex_Free_Hiker\image_3.jpg", "top_img": r"images\Adidas_Terrex_Free_Hiker\image_4.jpg"
    },
    {
        "id": "Adidas_Superstar", "name": "Adidas Superstar", "price": 8999, "color": "Core Black/White", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Classic", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Superstar\image_1.jpg", "back_img": r"images\Adidas_Superstar\image_2.jpg", 
        "side_img": r"images\Adidas_Superstar\image_3.jpg", "top_img": r"images\Adidas_Superstar\image_4.jpg"
    },
    {
        "id": "Adidas_NMD_R1", "name": "Adidas NMD_R1", "price": 12999, "color": "Cloud White", 
        "material": "Knit", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_NMD_R1\image_1.jpg", "back_img": r"images\Adidas_NMD_R1\image_2.jpg", 
        "side_img": r"images\Adidas_NMD_R1\image_3.jpg", "top_img": r"images\Adidas_NMD_R1\image_4.jpg"
    },
    {
        "id": "Adidas_Adizero_Boston_12", "name": "Adidas Adizero Boston 12", "price": 14999, "color": "Solar Red", 
        "material": "Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Continental Rubber", "style": "Racing", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Adizero_Boston_12\image_1.jpg", "back_img": r"images\Adidas_Adizero_Boston_12\image_2.jpg", 
        "side_img": r"images\Adidas_Adizero_Boston_12\image_3.jpg", "top_img": r"images\Adidas_Adizero_Boston_12\image_4.jpg"
    },
    {
        "id": "Adidas_Campus_00s", "name": "Adidas Campus 00s", "price": 9999, "color": "Grey/White", 
        "material": "Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Chunky", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Campus_00s\image_1.jpg", "back_img": r"images\Adidas_Campus_00s\image_2.jpg", 
        "side_img": r"images\Adidas_Campus_00s\image_3.jpg", "top_img": r"images\Adidas_Campus_00s\image_4.jpg"
    },
    {
        "id": "Adidas_Stan_Smith", "name": "Adidas Stan Smith", "price": 7999, "color": "White/Green", 
        "material": "Recycled Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Classic", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Stan_Smith\image_1.jpg", "back_img": r"images\Adidas_Stan_Smith\image_2.jpg", 
        "side_img": r"images\Adidas_Stan_Smith\image_3.jpg", "top_img": r"images\Adidas_Stan_Smith\image_4.jpg"
    },
    {
        "id": "Adidas_Predator_Accuracy", "name": "Adidas Predator Accuracy", "price": 18999, "color": "Black/White/Pink", 
        "material": "HybridTouch", "closure": "Laceless", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "TPU", "style": "Football", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Predator_Accuracy\image_1.jpg", "back_img": r"images\Adidas_Predator_Accuracy\image_2.jpg", 
        "side_img": r"images\Adidas_Predator_Accuracy\image_3.jpg", "top_img": r"images\Adidas_Predator_Accuracy\image_4.jpg"
    },
    {
        "id": "Adidas_SL_72", "name": "Adidas SL 72", "price": 8999, "color": "Blue/Yellow", 
        "material": "Nylon/Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Retro", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_SL_72\image_1.jpg", "back_img": r"images\Adidas_SL_72\image_2.jpg", 
        "side_img": r"images\Adidas_SL_72\image_3.jpg", "top_img": r"images\Adidas_SL_72\image_4.jpg"
    },
    {
        "id": "Adidas_Samba_Decon", "name": "Adidas Samba Decon", "price": 12999, "color": "Black/White", 
        "material": "Soft Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Minimalist", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Samba_Decon\image_1.jpg", "back_img": r"images\Adidas_Samba_Decon\image_2.jpg", 
        "side_img": r"images\Adidas_Samba_Decon\image_3.jpg", "top_img": r"images\Adidas_Samba_Decon\image_4.jpg"
    },
    {
        "id": "Adidas_Response_CL", "name": "Adidas Response CL", "price": 10999, "color": "Crystal White", 
        "material": "Suede/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Dad Shoe", "manufacturer": "Adidas",
        "front_img": r"images\Adidas_Response_CL\image_1.jpg", "back_img": r"images\Adidas_Response_CL\image_2.jpg", 
        "side_img": r"images\Adidas_Response_CL\image_3.jpg", "top_img": r"images\Adidas_Response_CL\image_4.jpg"
    },

    # --- NIKE ---
    {
        "id": "Nike_Dunk_Low", "name": "Nike Dunk Low", "price": 10995, "color": "Panda Black/White", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Skateboarding", "manufacturer": "Nike",
        "front_img": r"images\Nike_Dunk_Low\image_1.jpg", "back_img": r"images\Nike_Dunk_Low\image_2.jpg", 
        "side_img": r"images\Nike_Dunk_Low\image_3.jpg", "top_img": r"images\Nike_Dunk_Low\image_4.jpg"
    },
    {
        "id": "Nike_Air_Max_DN", "name": "Nike Air Max DN", "price": 14995, "color": "Black/Dark Smoke", 
        "material": "Mesh", "closure": "Laces", "heel": "Platform", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Nike",
        "front_img": r"images\Nike_Air_Max_DN\image_1.jpg", "back_img": r"images\Nike_Air_Max_DN\image_2.jpg", 
        "side_img": r"images\Nike_Air_Max_DN\image_3.jpg", "top_img": r"images\Nike_Air_Max_DN\image_4.jpg"
    },
    {
        "id": "Nike_Air_Force_1_'07", "name": "Nike Air Force 1 '07", "price": 9995, "color": "Triple White", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Nike",
        "front_img": r"images\Nike_Air_Force_1_'07\image_1.jpg", "back_img": r"images\Nike_Air_Force_1_'07\image_2.jpg", 
        "side_img": r"images\Nike_Air_Force_1_'07\image_3.jpg", "top_img": r"images\Nike_Air_Force_1_'07\image_4.jpg"
    },
    {
        "id": "Nike_Zoom_Vomero_5", "name": "Nike Zoom Vomero 5", "price": 13995, "color": "White/Wolf Grey", 
        "material": "Mesh/Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "Nike",
        "front_img": r"images\Nike_Zoom_Vomero_5\image_1.jpg", "back_img": r"images\Nike_Zoom_Vomero_5\image_2.jpg", 
        "side_img": r"images\Nike_Zoom_Vomero_5\image_3.jpg", "top_img": r"images\Nike_Zoom_Vomero_5\image_4.jpg"
    },
    {
        "id": "Nike_Air_Max_97", "name": "Nike Air Max 97", "price": 15995, "color": "Silver Bullet", 
        "material": "Synthetic/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Nike",
        "front_img": r"images\Nike_Air_Max_97\image_1.jpg", "back_img": r"images\Nike_Air_Max_97\image_2.jpg", 
        "side_img": r"images\Nike_Air_Max_97\image_3.jpg", "top_img": r"images\Nike_Air_Max_97\image_4.jpg"
    },
    {
        "id": "Nike_Invincible_3", "name": "Nike Invincible 3", "price": 16995, "color": "White/Blue", 
        "material": "Flyknit", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "Nike",
        "front_img": r"images\Nike_Invincible_3\image_1.jpg", "back_img": r"images\Nike_Invincible_3\image_2.jpg", 
        "side_img": r"images\Nike_Invincible_3\image_3.jpg", "top_img": r"images\Nike_Invincible_3\image_4.jpg"
    },
    {
        "id": "Nike_Air_Max_90", "name": "Nike Air Max 90", "price": 12995, "color": "Infrared", 
        "material": "Leather/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Nike",
        "front_img": r"images\Nike_Air_Max_90\image_1.jpg", "back_img": r"images\Nike_Air_Max_90\image_2.jpg", 
        "side_img": r"images\Nike_Air_Max_90\image_3.jpg", "top_img": r"images\Nike_Air_Max_90\image_4.jpg"
    },
    {
        "id": "Nike_Metcon_9", "name": "Nike Metcon 9", "price": 11995, "color": "Black/Anthracite", 
        "material": "Mesh/Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Training", "manufacturer": "Nike",
        "front_img": r"images\Nike_Metcon_9\image_1.jpg", "back_img": r"images\Nike_Metcon_9\image_2.jpg", 
        "side_img": r"images\Nike_Metcon_9\image_3.jpg", "top_img": r"images\Nike_Metcon_9\image_4.jpg"
    },
    {
        "id": "Nike_Blazer_Mid_'77", "name": "Nike Blazer Mid '77", "price": 9995, "color": "White/Black", 
        "material": "Leather/Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Basketball", "manufacturer": "Nike",
        "front_img": r"images\Nike_Blazer_Mid_'77\image_1.jpg", "back_img": r"images\Nike_Blazer_Mid_'77\image_2.jpg", 
        "side_img": r"images\Nike_Blazer_Mid_'77\image_3.jpg", "top_img": r"images\Nike_Blazer_Mid_'77\image_4.jpg"
    },
    {
        "id": "Nike_Killshot_2", "name": "Nike Killshot 2", "price": 8995, "color": "Sail/Midnight Navy", 
        "material": "Leather/Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Minimalist", "manufacturer": "Nike",
        "front_img": r"images\Nike_Killshot_2\image_1.jpg", "back_img": r"images\Nike_Killshot_2\image_2.jpg", 
        "side_img": r"images\Nike_Killshot_2\image_3.jpg", "top_img": r"images\Nike_Killshot_2\image_4.jpg"
    },
    {
        "id": "Nike_V2K_Run", "name": "Nike V2K Run", "price": 10995, "color": "Summit White", 
        "material": "Mesh/Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Retro", "manufacturer": "Nike",
        "front_img": r"images\Nike_V2K_Run\image_1.jpg", "back_img": r"images\Nike_V2K_Run\image_2.jpg", 
        "side_img": r"images\Nike_V2K_Run\image_3.jpg", "top_img": r"images\Nike_V2K_Run\image_4.jpg"
    },
    {
        "id": "Nike_Pegasus_41", "name": "Nike Pegasus 41", "price": 12995, "color": "Volt/Black", 
        "material": "Engineered Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "Nike",
        "front_img": r"images\Nike_Pegasus_41\image_1.jpg", "back_img": r"images\Nike_Pegasus_41\image_2.jpg", 
        "side_img": r"images\Nike_Pegasus_41\image_3.jpg", "top_img": r"images\Nike_Pegasus_41\image_4.jpg"
    },
    {
        "id": "Nike_React_Infinity_3", "name": "Nike React Infinity 3", "price": 14995, "color": "Platinum", 
        "material": "Flyknit", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "Nike",
        "front_img": r"images\Nike_React_Infinity_3\image_1.jpg", "back_img": r"images\Nike_React_Infinity_3\image_2.jpg", 
        "side_img": r"images\Nike_React_Infinity_3\image_3.jpg", "top_img": r"images\Nike_React_Infinity_3\image_4.jpg"
    },
    {
        "id": "Nike_Cortez", "name": "Nike Cortez", "price": 7995, "color": "White/Varsity Red", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Classic", "manufacturer": "Nike",
        "front_img": r"images\Nike_Cortez\image_1.jpg", "back_img": r"images\Nike_Cortez\image_2.jpg", 
        "side_img": r"images\Nike_Cortez\image_3.jpg", "top_img": r"images\Nike_Cortez\image_4.jpg"
    },
    {
        "id": "Nike_Air_Max_Plus", "name": "Nike Air Max Plus", "price": 15995, "color": "Sunset Orange", 
        "material": "Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Nike",
        "front_img": r"images\Nike_Air_Max_Plus\image_1.jpg", "back_img": r"images\Nike_Air_Max_Plus\image_2.jpg", 
        "side_img": r"images\Nike_Air_Max_Plus\image_3.jpg", "top_img": r"images\Nike_Air_Max_Plus\image_4.jpg"
    },
    {
        "id": "Nike_P-6000", "name": "Nike P-6000", "price": 9995, "color": "Metallic Silver", 
        "material": "Mesh/Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Retro", "manufacturer": "Nike",
        "front_img": r"images\Nike_P-6000\image_1.jpg", "back_img": r"images\Nike_P-6000\image_2.jpg", 
        "side_img": r"images\Nike_P-6000\image_3.jpg", "top_img": r"images\Nike_P-6000\image_4.jpg"
    },

    # --- PUMA ---
    {
        "id": "Puma_Deviate_Nitro_3", "name": "Puma Deviate Nitro 3", "price": 15999, "color": "Mint Melt", 
        "material": "Engineered Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Pumagrip Rubber", "style": "Running", "manufacturer": "Puma",
        "front_img": r"images\Puma_Deviate_Nitro_3\image_1.jpg", "back_img": r"images\Puma_Deviate_Nitro_3\image_2.jpg", 
        "side_img": r"images\Puma_Deviate_Nitro_3\image_3.jpg", "top_img": r"images\Puma_Deviate_Nitro_3\image_4.jpg"
    },
    {
        "id": "Puma_Palermo", "name": "Puma Palermo", "price": 8999, "color": "Grape Mist/Gum", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Gum Rubber", "style": "Terrace", "manufacturer": "Puma",
        "front_img": r"images\Puma_Palermo\image_1.jpg", "back_img": r"images\Puma_Palermo\image_2.jpg", 
        "side_img": r"images\Puma_Palermo\image_3.jpg", "top_img": r"images\Puma_Palermo\image_4.jpg"
    },
    {
        "id": "Puma_Speedcat_OG", "name": "Puma Speedcat OG", "price": 9999, "color": "For All Time Red", 
        "material": "Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Motorsport", "manufacturer": "Puma",
        "front_img": r"images\Puma_Speedcat_OG\image_1.jpg", "back_img": r"images\Puma_Speedcat_OG\image_2.jpg", 
        "side_img": r"images\Puma_Speedcat_OG\image_3.jpg", "top_img": r"images\Puma_Speedcat_OG\image_4.jpg"
    },
    {
        "id": "Puma_Fast-R_Nitro_Elite", "name": "Puma Fast-R Nitro Elite", "price": 22999, "color": "Electric Orchid", 
        "material": "Carbon Fiber", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Pumagrip", "style": "Racing", "manufacturer": "Puma",
        "front_img": r"images\Puma_Fast-R_Nitro_Elite\image_1.jpg", "back_img": r"images\Puma_Fast-R_Nitro_Elite\image_2.jpg", 
        "side_img": r"images\Puma_Fast-R_Nitro_Elite\image_3.jpg", "top_img": r"images\Puma_Fast-R_Nitro_Elite\image_4.jpg"
    },
    {
        "id": "Puma_Future_Rider", "name": "Puma Future Rider", "price": 7999, "color": "Multi-Color", 
        "material": "Nylon/Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Puma",
        "front_img": r"images\Puma_Future_Rider\image_1.jpg", "back_img": r"images\Puma_Future_Rider\image_2.jpg", 
        "side_img": r"images\Puma_Future_Rider\image_3.jpg", "top_img": r"images\Puma_Future_Rider\image_4.jpg"
    },
    {
        "id": "Puma_Nitro_Elite_4", "name": "Puma Nitro Elite 4", "price": 21999, "color": "Pure Pink", 
        "material": "Carbon Fiber/Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Racing", "manufacturer": "Puma",
        "front_img": r"images\Puma_Nitro_Elite_4\image_1.jpg", "back_img": r"images\Puma_Nitro_Elite_4\image_2.jpg", 
        "side_img": r"images\Puma_Nitro_Elite_4\image_3.jpg", "top_img": r"images\Puma_Nitro_Elite_4\image_4.jpg"
    },
    {
        "id": "Puma_Slipstream", "name": "Puma Slipstream", "price": 10999, "color": "White/Black", 
        "material": "Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Basketball", "manufacturer": "Puma",
        "front_img": r"images\Puma_Slipstream\image_1.jpg", "back_img": r"images\Puma_Slipstream\image_2.jpg", 
        "side_img": r"images\Puma_Slipstream\image_3.jpg", "top_img": r"images\Puma_Slipstream\image_4.jpg"
    },
    {
        "id": "Puma_Mayze", "name": "Puma Mayze", "price": 9999, "color": "Puma White", 
        "material": "Leather", "closure": "Laces", "heel": "Platform", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Puma",
        "front_img": r"images\Puma_Mayze\image_1.jpg", "back_img": r"images\Puma_Mayze\image_2.jpg", 
        "side_img": r"images\Puma_Mayze\image_3.jpg", "top_img": r"images\Puma_Mayze\image_4.jpg"
    },
    {
        "id": "Puma_RS-X_Efekt", "name": "Puma RS-X Efekt", "price": 11999, "color": "White/Cool Grey", 
        "material": "Mesh/Nubuck", "closure": "Laces", "heel": "Chunky", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Puma",
        "front_img": r"images\Puma_RS-X_Efekt\image_1.jpg", "back_img": r"images\Puma_RS-X_Efekt\image_2.jpg", 
        "side_img": r"images\Puma_RS-X_Efekt\image_3.jpg", "top_img": r"images\Puma_RS-X_Efekt\image_4.jpg"
    },
    {
        "id": "Puma_Velocity_Nitro_4", "name": "Puma Velocity Nitro 4", "price": 12999, "color": "White/Glowing Red", 
        "material": "Mesh", "closure": "Laces", "heel": "Flat", "water_resistance": "Water-Resistant", 
        "sole_material": "Rubber", "style": "Running", "manufacturer": "Puma",
        "front_img": r"images\Puma_Velocity_Nitro_4\image_1.jpg", "back_img": r"images\Puma_Velocity_Nitro_4\image_2.jpg", 
        "side_img": r"images\Puma_Velocity_Nitro_4\image_3.jpg", "top_img": r"images\Puma_Velocity_Nitro_4\image_4.jpg"
    },
    {
        "id": "Puma_Suede_Classic", "name": "Puma Suede Classic", "price": 7999, "color": "Black/White", 
        "material": "Suede", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Puma",
        "front_img": r"images\Puma_Suede_Classic\image_1.jpg", "back_img": r"images\Puma_Suede_Classic\image_2.jpg", 
        "side_img": r"images\Puma_Suede_Classic\image_3.jpg", "top_img": r"images\Puma_Suede_Classic\image_4.jpg"
    },
    {
        "id": "Puma_Morphic", "name": "Puma Morphic", "price": 8999, "color": "White/Blue", 
        "material": "Mesh/Synthetic", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Running-Style", "manufacturer": "Puma",
        "front_img": r"images\Puma_Morphic\image_1.jpg", "back_img": r"images\Puma_Morphic\image_2.jpg", 
        "side_img": r"images\Puma_Morphic\image_3.jpg", "top_img": r"images\Puma_Morphic\image_4.jpg"
    },
    {
        "id": "Puma_Caven_2.0", "name": "Puma Caven 2.0", "price": 6999, "color": "White/Grey", 
        "material": "Synthetic Leather", "closure": "Laces", "heel": "Flat", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Puma",
        "front_img": r"images\Puma_Caven_2.0\image_1.jpg", "back_img": r"images\Puma_Caven_2.0\image_2.jpg", 
        "side_img": r"images\Puma_Caven_2.0\image_3.jpg", "top_img": r"images\Puma_Caven_2.0\image_4.jpg"
    },
    {
        "id": "Puma_Cali_Dream", "name": "Puma Cali Dream", "price": 9999, "color": "White/Pastel Pink", 
        "material": "Leather", "closure": "Laces", "heel": "Platform", "water_resistance": "Not Resistant", 
        "sole_material": "Rubber", "style": "Lifestyle", "manufacturer": "Puma",
        "front_img": r"images\Puma_Cali_Dream\image_1.jpg", "back_img": r"images\Puma_Cali_Dream\image_2.jpg", 
        "side_img": r"images\Puma_Cali_Dream\image_3.jpg", "top_img": r"images\Puma_Cali_Dream\image_4.jpg"
    }
]

def seed_database():
    db = SessionLocal()
    try:
        print("Checking for existing records...")
        for data in shoe_data:
            existing_shoe = db.query(StaticShoe).filter(StaticShoe.id == data["id"]).first()
            if not existing_shoe:
                print(f"Adding {data['name']} to catalog...")
                new_shoe = StaticShoe(**data)
                db.add(new_shoe)
            else:
                print(f"Skipping {data['name']} (Already in DB)")
        
        db.commit()
        print("\n✅ SUCCESS: Massive Static Catalog Database Seeded Successfully!")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()