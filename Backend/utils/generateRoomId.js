//here i am going to generating room Id from Scratch and the sessio will expire soon

export const generateRoomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let roomId = "LIVE-";

  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return roomId;
};

//from this rooom id i am going to use in the controller of finding the value
