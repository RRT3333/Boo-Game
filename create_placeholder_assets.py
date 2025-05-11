import os
import json

def create_empty_file(path):
    """Create an empty file if it doesn't exist"""
    directory = os.path.dirname(path)
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    if not os.path.exists(path):
        with open(path, 'w') as f:
            f.write("")

def create_placeholder_assets():
    """Create all the required placeholder asset files"""
    assets = {
        # Character assets
        "static/assets/character/duck.png": "Boo 캐릭터",
        "static/assets/character/professor.png": "교수님 캐릭터",
        
        # Customization - Outfits
        "static/assets/customization/default.png": "기본 의상",
        "static/assets/customization/casual.png": "캐주얼 의상",
        "static/assets/customization/formal.png": "정장 의상",
        "static/assets/customization/sporty.png": "스포츠 의상",
        "static/assets/customization/hoodie.png": "후드 의상",
        
        # Customization - Hats
        "static/assets/customization/none_hat.png": "모자 없음",
        "static/assets/customization/cap.png": "모자 - 야구모자",
        "static/assets/customization/beanie.png": "모자 - 비니",
        "static/assets/customization/graduation.png": "모자 - 졸업모",
        "static/assets/customization/sunglasses.png": "모자 - 선글라스",
        
        # Customization - Shoes
        "static/assets/customization/default_shoes.png": "기본 신발",
        "static/assets/customization/sneakers.png": "신발 - 운동화",
        "static/assets/customization/boots.png": "신발 - 부츠",
        "static/assets/customization/sandals.png": "신발 - 샌들",
        "static/assets/customization/dress.png": "신발 - 구두",
        
        # Items
        "static/assets/items/a_plus.png": "아이템 - A+",
        "static/assets/items/coin.png": "아이템 - 코인",
        
        # Obstacles
        "static/assets/obstacles/f_grade.png": "장애물 - F",
        "static/assets/obstacles/folder.png": "장애물 - 폴더",
        "static/assets/obstacles/program.png": "장애물 - 프로그램",
        "static/assets/obstacles/door.png": "장애물 - 문",
        
        # Backgrounds - Stages
        "static/assets/backgrounds/stage1_liberal.jpg": "배경 - 교양관",
        "static/assets/backgrounds/stage2_myungsu.jpg": "배경 - 명수당",
        "static/assets/backgrounds/stage3_engineering.jpg": "배경 - 공대",
        "static/assets/backgrounds/stage4_baekyeon.jpg": "배경 - 백년관",
        "static/assets/backgrounds/stage5_dorm.jpg": "배경 - 기숙사",
        "static/assets/backgrounds/stage6_gate.jpg": "배경 - 정문",
        
        # Backgrounds - Pages
        "static/assets/backgrounds/main_bg.jpg": "배경 - 메인페이지",
        "static/assets/backgrounds/customize_bg.jpg": "배경 - 커스터마이징",
        "static/assets/backgrounds/leaderboard_bg.jpg": "배경 - 리더보드",
        "static/assets/backgrounds/presentation_bg.jpg": "배경 - 발표화면",
        
        # UI
        "static/assets/ui/heart.png": "UI - 하트",
        "static/assets/ui/qr_code.png": "UI - QR코드",
        "static/assets/ui/school_logo.png": "UI - 학교로고",
        "static/assets/ui/speech_bubble.png": "UI - 말풍선",
        
        # Effects
        "static/assets/effects/combo_effect.png": "이펙트 - 콤보",
        "static/assets/effects/stage_clear.png": "이펙트 - 스테이지 클리어"
    }
    
    asset_specs = {
        "character": "150x150px",
        "professor": "180x200px",
        "outfit": "150x150px",
        "hat": "80x60px",
        "shoes": "60x40px",
        "item": "80x80px",
        "obstacle": "100x100px",
        "background": "1600x900px",
        "presentation_bg": "1920x1080px",
        "heart": "40x40px",
        "qr_code": "200x200px",
        "logo": "200x200px",
        "speech_bubble": "300x200px",
        "effect": "120x60px",
        "stage_clear": "400x200px"
    }
    
    # Generate placeholder files
    for file_path, description in assets.items():
        create_empty_file(file_path)
        print(f"Created placeholder for: {file_path}")
    
    # Generate asset information JSON file
    with open('asset_info.json', 'w') as f:
        json.dump({
            "assets": assets,
            "specs": asset_specs
        }, f, indent=2)
    
    print("\nAll placeholder assets created successfully!")
    print("See asset_info.json for details on each asset.")

if __name__ == "__main__":
    create_placeholder_assets() 