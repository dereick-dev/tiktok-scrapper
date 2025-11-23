<<<<<<< HEAD
import requests
import json

API_URL = "https://your-api.koyeb.app"

def get_user_profile(username):
    try:
        response = requests.get(f"{API_URL}/api/v1/user/{username}")
        response.raise_for_status()
        
        data = response.json()
        
        if data['success']:
            user = data['data']['user']
            stats = data['data']['stats']
            
            print(f"User Profile:")
            print(f"Name: {user['nickname']}")
            print(f"Username: @{user['uniqueId']}")
            print(f"Followers: {stats['followers']:,}")
            print(f"Videos: {stats['videos']:,}")
            print(f"Likes: {stats['likes']:,}")
            print(f"URL: {data['data']['url']}")
            
            return data['data']
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage
if __name__ == "__main__":
=======
import requests
import json

API_URL = "https://your-api.koyeb.app"

def get_user_profile(username):
    try:
        response = requests.get(f"{API_URL}/api/v1/user/{username}")
        response.raise_for_status()
        
        data = response.json()
        
        if data['success']:
            user = data['data']['user']
            stats = data['data']['stats']
            
            print(f"User Profile:")
            print(f"Name: {user['nickname']}")
            print(f"Username: @{user['uniqueId']}")
            print(f"Followers: {stats['followers']:,}")
            print(f"Videos: {stats['videos']:,}")
            print(f"Likes: {stats['likes']:,}")
            print(f"URL: {data['data']['url']}")
            
            return data['data']
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage
if __name__ == "__main__":
>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
    get_user_profile('khaby.lame')