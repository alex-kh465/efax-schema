import pandas as pd
import json
import os

def clean_data():
    # Load the data
    df = pd.read_csv('efax_analysis.csv')
    
    # Filter strictly for status_code == 200
    df['status_code'] = pd.to_numeric(df['status_code'], errors='coerce')
    df = df[df['status_code'] == 200]
    
    # Clean schema_types_found
    # Remove 'Unknown' from the string list if present
    def clean_schema_list(x):
        if pd.isna(x) or x == '':
            return ''
        items = [i.strip() for i in str(x).split(',')]
        items = [i for i in items if i.lower() != 'unknown' and i != '']
        return ', '.join(items)

    if 'schema_types_found' in df.columns:
        df['schema_types_found'] = df['schema_types_found'].apply(clean_schema_list)

    # Clean primary_schema_type
    # If it is 'Unknown' or 'None', try to infer from schema_types_found or set to 'WebPage' (default) or leave empty
    # User said "unknown columns should be completly gone", so let's replace 'Unknown' with something else or drop?
    # Better to just replace with 'Unspecified' or if empty, maybe 'WebPage' if that's a safe fallback, 
    # but let's just ensure it's not "Unknown".
    if 'primary_schema_type' in df.columns:
        df['primary_schema_type'] = df['primary_schema_type'].replace(['Unknown', 'None', 'nan'], 'Unspecified')
        # If still unspecified, maybe check if schema_types_found has something?
        # For now, let's stick to replacing explicit 'Unknown'.

    # Also clean page_type if it is 'Unknown'
    if 'page_type' in df.columns:
         df['page_type'] = df['page_type'].replace(['Unknown', 'None', 'nan'], 'Uncategorized')

    df = df.fillna({
        'missing_required_properties': '',
        'validation_errors': '',
        'recommended_schemas': '',
        'recommendation_priority': '',
        'primary_schema_type': 'Unspecified',
        'page_type': 'Uncategorized'
    })
    
    # Replace any remaining NaNs with None (which becomes null in JSON)
    # or empty string/0 depending on preference.
    # Let's replace remaining numeric NaNs with 0 and string NaNs with ""
    # But simpler: just replace all NaNs with None, json.dump handles None as null.
    df = df.where(pd.notnull(df), None)
    
    # Create output directory if it doesn't exist
    os.makedirs('src/data', exist_ok=True)
    
    # Convert to list of dicts
    data = df.to_dict(orient='records')
    
    # Save to JSON
    with open('src/data/cleaned_data.json', 'w') as f:
        # ensure_ascii=False for better character handling
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Cleaned data saved to src/data/cleaned_data.json. Total records: {len(data)}")

if __name__ == "__main__":
    clean_data()
