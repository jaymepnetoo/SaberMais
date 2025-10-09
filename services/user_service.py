from model.models import User

def get_user_info(db, user_id):
    return User.get_by_id(db, user_id)
