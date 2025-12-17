import axios from "axios";
import { createContext, useState, type PropsWithChildren } from "react";

export interface Challenges {
  id: number;
  team1_id: number;
  team2_id: number;
  date: string;
  location: string;
  message: string;
  status: string;
  created_at?: string;
  responded_at?: string;
  match_time: string;
  team_name: string;
  team2_name: string;
}

interface MatchRequestsProps {
  getTeamMatchRequests: () => {};
  loading: {
    getTeamMatchRequests: boolean;
    getReceivedRequests: boolean;
    getOpenedRequest: boolean;
    acceptMatchRequest: boolean;
    rejectMatchRequest: boolean;
    createNewMatchRequest: boolean;
    deleteMatchRequest: boolean;
    editMatchRequest: boolean;
    getAcceptedRequests: boolean;
    acceptMatchChallenge: boolean;
    rejectMatchChallenge: boolean;
    createNewMatchChallenge: boolean;
    getSentChallenges: boolean;
    getReceivedChallenges: boolean;
    deleteSentChallenges: boolean;
  };
  loadChallenges: boolean;
  createNewMatchRequest: (
    location: string,
    date: string,
    time: string,
    message: string
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  deleteMatchRequest: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  editMatchRequest: (
    id: number,
    updates: any
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  matchRequests: [
    {
      id: number;
      date: string;
      time: string;
      message: string;
      location: string;
    }
  ];
  getAcceptedRequests: () => {};
  acceptedRequests: [];
  acceptMatchRequest: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  createNewMatchChallenge: (
    date: string,
    location: string,
    message: string,
    match_time: string,
    team1_id: number,
    team2_id: number
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  acceptMatchChallenge: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  rejectMatchChallenge: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  getSentChallenges: () => {};
  sentChallenges: Challenges[];
  receivedChallenges: Challenges[];
  deleteSentChallenges: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  getAllChallenges: () => {};
}

export const MatchRequestsContext = createContext<MatchRequestsProps | null>(
  null
);

export const MatchRequestsProvider = ({ children }: PropsWithChildren) => {
  const [matchRequests, setMatchRequests] = useState([]);
  const [openedRequests, setOpenedRequests] = useState([]);
  const [loading, setLoading] = useState({
    getTeamMatchRequests: false,
    getOpenedRequest: false,
    acceptMatchRequest: false,
    rejectMatchRequest: false,
    createNewMatchRequest: false,
    deleteMatchRequest: false,
    editMatchRequest: false,
    getAcceptedRequests: false,
    acceptMatchChallenge: false,
    rejectMatchChallenge: false,
    createNewMatchChallenge: false,
    getSentChallenges: false,
    getReceivedChallenges: false,
    deleteSentChallenges: false,
  });
  const [loadChallenges, setLoadChallenges] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState<[]>([]);
  const [receivedChallenges, setReceivedChallenges] = useState<Challenges[]>(
    []
  );
  const [sentChallenges, setSentChallenges] = useState<Challenges[]>([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const getTeamMatchRequests = async () => {
    setLoading((prev) => ({ ...prev, getTeamMatchRequests: true }));
    const token = localStorage.getItem("token");
    try {
      const reponse = await axios.get("http://localhost:3000/match-requests/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = reponse.data;
      setMatchRequests(data.matchRequest);
      console.log("Team Match ReQUESTS", data.matchRequest);
    } catch (error) {
      console.error("Error getting team match requests", error);
    } finally {
      setLoading((prev) => ({ ...prev, getTeamMatchRequests: false }));
    }
  };

  // get all opened request
  const getOpenedRequest = async () => {
    setLoading((prev) => ({ ...prev, getOpenedRequest: true }));
    try {
      const response = await axios.get(
        "http://localhost:3000/match-requests/opened"
      );
      const data = response.data;
      setOpenedRequests(data.openedRequests);
      console.log("All match requests", data.openedRequests);
    } catch (error) {
      console.error("Cannot get match requests", error);
    } finally {
      setLoading((prev) => ({ ...prev, getOpenedRequest: false }));
    }
  };

  // get all accepted requests
  const getAcceptedRequests = async () => {
    setLoading((prev) => ({ ...prev, getAcceptedRequests: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:3000/match-requests/accepted",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setAcceptedRequests(data.acceptedRequests);
      console.log("Accepted requests", data.acceptedRequests);
    } catch (error) {
      console.error("Error occured, something went wrong");
    } finally {
      setLoading((prev) => ({ ...prev, getAcceptedRequests: false }));
    }
  };

  // create new match request
  const createNewMatchRequest = async (
    location: string,
    date: string,
    time: string,
    message: string
  ) => {
    setLoading((prev) => ({ ...prev, createNewMatchRequest: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:3000/match-requests/",
        {
          location,
          date,
          time,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setMatchRequests((prev) => [...prev, data.requestedMatch]);
      return { success: true, message: data.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return { success: false, message: errorMessage };
    } finally {
      setLoading((prev) => ({ ...prev, createNewMatchRequest: false }));
    }
  };

  // edit match request
  const editMatchRequest = async (id: number, updates: any) => {
    setLoading((prev) => ({ ...prev, editMatchRequest: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:3000/match-requests/${id}`,
        {
          updates: updates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setMatchRequests((prevRequest) =>
        prevRequest.map((request) =>
          request.id === id ? data.updatedMatchRequest : request
        )
      );
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Something occured, error";

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading((prev) => ({ ...prev, editMatchRequest: false }));
    }
  };

  // delete match request
  const deleteMatchRequest = async (id: number) => {
    setLoading((prev) => ({ ...prev, deleteMatchRequest: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `http://localhost:3000/match-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setMatchRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );
      return { success: true, message: data.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return { success: false, message: errorMessage };
    } finally {
      setLoading((prev) => ({ ...prev, deleteMatchRequest: false }));
    }
  };

  // accept match request
  const acceptMatchRequest = async (id: number) => {
    setLoading((prev) => ({ ...prev, acceptMatchRequest: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:3000/match-requests/${id}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return { success: false, message: errorMessage };
    } finally {
      setLoading((prev) => ({ ...prev, acceptMatchRequest: false }));
    }
  };

  // get all teams that has joined request
  const getReceivedRequests = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:3000/match-requests/received-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setReceivedRequests(data.receivedRequests);
      console.log("Received Requests", data.receivedRequests);
    } catch (error: any) {
      console.error("Something went wrong, not received", error);
    }
  };

  // get all received challenges
  const getAllChallenges = async () => {
    setLoadChallenges(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:3000/match-requests/challenges/received",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setReceivedChallenges(data.challenges);
      console.log("Your received challenges", data.challenges);
    } catch (error) {
      console.error("Error occured, something went wrong");
    } finally {
      setLoadChallenges(false);
    }
  };

  // get all sent challenges
  const getSentChallenges = async () => {
    setLoadChallenges(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:3000/match-requests/challenges/sent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setSentChallenges(data.sentChallenges);
      console.log("Sent Challenges", data);
    } catch (error: any) {
      console.error("Something went wrong", error);
    } finally {
      setLoadChallenges(false);
    }
  };

  const deleteSentChallenges = async (id: number) => {
    const token = localStorage.getItem("token");
    setLoading((prev) => ({ ...prev, deleteSentChallenges: true }));
    try {
      const response = await axios.delete(
        `http://localhost:3000/match-requests/challenges/sent/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setSentChallenges((prev) => prev.filter((sent) => sent.id !== id));
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return { success: false, message: errorMessage };
    } finally {
      setLoading((prev) => ({ ...prev, deleteSentChallenges: false }));
    }
  };

  // create a new challenge
  const createNewMatchChallenge = async (
    date: string,
    location: string,
    message: string,
    match_time: string,
    team1_id: number,
    team2_id: number
  ) => {
    setLoading((prev) => ({ ...prev, createNewMatchChallenge: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:3000/match-requests/send-challenge`,
        {
          date,
          location,
          message,
          match_time,
          team1_id,
          team2_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setSentChallenges((prev) => [...prev, data.incomingRequest]);
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      console.error("Something went wrong, error");
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading((prev) => ({ ...prev, createNewMatchChallenge: false }));
    }
  };

  // accept a challenge
  const acceptMatchChallenge = async (id: number) => {
    setLoading((prev) => ({ ...prev, acceptMatchChallenge: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:3000/match-requests/challenges/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      console.log("Accepted match", data);
      setAcceptedRequests((prevMatches) => [...prevMatches, ...data.match]);
      setReceivedChallenges((prev) => prev.filter((match) => match.id !== id));
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      console.error("Something went wrong, error");
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading((prev) => ({ ...prev, acceptMatchChallenge: false }));
    }
  };

  // reject match request
  const rejectMatchChallenge = async (id: number) => {
    setLoading((prev) => ({ ...prev, rejectMatchChallenge: true }));
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `http://localhost:3000/match-requests/challenges/${id}/reject`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setReceivedChallenges((prev) => prev.filter((match) => match.id !== id));
      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      console.error("Something went wrong, error");
      const errorMessage =
        error.response?.data?.message || "Error occured, something went wrong";
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading((prev) => ({ ...prev, rejectMatchChallenge: false }));
    }
  };
  return (
    <MatchRequestsContext.Provider
      value={{
        getTeamMatchRequests,
        matchRequests,
        openedRequests,
        getOpenedRequest,
        createNewMatchRequest,
        loading,
        deleteMatchRequest,
        editMatchRequest,
        getAcceptedRequests,
        acceptedRequests,
        acceptMatchRequest,
        getAllChallenges,
        receivedChallenges,
        createNewMatchChallenge,
        acceptMatchChallenge,
        rejectMatchChallenge,
        getSentChallenges,
        sentChallenges,
        loadChallenges,
        deleteSentChallenges,
        getReceivedRequests,
        receivedRequests,
      }}
    >
      {children}
    </MatchRequestsContext.Provider>
  );
};
