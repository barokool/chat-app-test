import axios from "axios";
import { intance } from "~/axios";

export interface IRoom {
  id: number;
  members: any[];
}

export const getConversationByUsers = async (
  usersId: string
): Promise<IRoom | undefined> => {
  try {
    const response = await intance.get(`/rooms?users=${usersId}`);

    return response.data;
  } catch (error) {
    console.log("erorr ", error);
  }
};

export const createConversation = async (
  userIds: string
): Promise<IRoom | undefined> => {
  try {
    const response = await intance.post("/rooms", {
      users: userIds,
    });

    return response.data;
  } catch (error) {
    console.log("erorr ", error);
  }
};
