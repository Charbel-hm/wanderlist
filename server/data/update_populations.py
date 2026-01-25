import json
import os

# Paths
LOCAL_JSON_PATH = r'c:\Users\HP\Desktop\Projects\wanderlist\server\data\countries.json'
API_DATA_PATH = r'c:\Users\HP\Desktop\Projects\wanderlist\server\data\api_data.json'

def update_populations():
    try:
        with open(LOCAL_JSON_PATH, 'r', encoding='utf-8') as f:
            local_data = json.load(f)
        
        with open(API_DATA_PATH, 'r', encoding='utf-8') as f:
            api_data = json.load(f)
        
        # Create mapping for quick lookup: {cca3: population} or {name: population}
        api_map_cca3 = {c['cca3']: c['population'] for c in api_data}
        api_map_name = {c['name']['common'].lower(): c['population'] for c in api_data}
        
        updated_count = 0
        zero_before = sum(1 for c in local_data if c.get('population') == 0)
        
        for country in local_data:
            if country.get('population') == 0:
                cca3 = country.get('cca3')
                name = country.get('name', {}).get('common', '').lower()
                
                new_pop = api_map_cca3.get(cca3)
                if new_pop is None:
                    new_pop = api_map_name.get(name)
                
                if new_pop is not None:
                    country['population'] = new_pop
                    updated_count += 1
                    print(f"Updated {country['name']['common']}: {new_pop}")
                else:
                    # Special cases/mismatches
                    if name == "dr congo":
                        new_pop = api_map_name.get("dr congo") or api_map_cca3.get("COD")
                    elif name == "curacao":
                        new_pop = api_map_name.get("curaçao")
                    elif name == "reunion":
                        new_pop = api_map_name.get("réunion")
                    
                    if new_pop:
                        country['population'] = new_pop
                        updated_count += 1
                        print(f"Updated (Special case) {country['name']['common']}: {new_pop}")
                    else:
                        print(f"Could not find population for {country['name']['common']}")
        
        with open(LOCAL_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(local_data, f, indent=2, ensure_ascii=False)
        
        zero_after = sum(1 for c in local_data if c.get('population') == 0)
        print(f"Update complete.")
        print(f"Total updated: {updated_count}")
        print(f"Zeros before: {zero_before}")
        print(f"Zeros after: {zero_after}")

    except Exception as e:
        print(f"Error during update: {e}")

if __name__ == "__main__":
    update_populations()
