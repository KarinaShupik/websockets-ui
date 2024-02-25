import storage from "../storage";
import { IRegisterUserResponse, IUser } from "../types";


export const registerUser = (user: IUser) => {
    const existingUser = storage.users.find((u) => u.name === user.name);
    const response: IRegisterUserResponse = {
      name: user.name,
      index: -1,
      error: false,
      errorText: "",
    };
  
    if (existingUser) {
      if (existingUser.password === user.password ) {
        response.index = existingUser.userId ?? -1;
      } else {
        response.error = true;
        response.errorText = "Wrong password";
      }

    } else {
      const newUser = { ...user, userId: storage.userId++ };
      storage.users.push(newUser);
      response.index = newUser.userId;
      return { response, user: newUser };
    }
  
    return { response, user: existingUser };
  };