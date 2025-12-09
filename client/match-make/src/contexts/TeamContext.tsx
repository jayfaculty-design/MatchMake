import axios from "axios";
import { createContext, useState, type PropsWithChildren } from "react";

interface TeamDetailsProps {
  id: number;
  name: string;
  email: string;
  skill_level: string;
  location: string;
}

interface TeamProps {
  getTeamDetails: () => {};
  teamDetails: TeamDetailsProps | null;
}

export const TeamContext = createContext<TeamProps | null>(null);

export const TeamProvider = ({ children }: PropsWithChildren) => {
  const [teamDetails, setTeamDetails] = useState<TeamDetailsProps | null>(null);
  const getTeamDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:3000/teams/me/my-team",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setTeamDetails(data.team);
    } catch (error) {
      console.error("Error getting team details", error);
    }
  };
  return (
    <TeamContext.Provider
      value={{
        getTeamDetails,
        teamDetails,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};
