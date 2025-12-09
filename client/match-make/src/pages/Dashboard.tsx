import {
  Button,
  Group,
  Input,
  Loader,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { BiChat, BiCheckCircle } from "react-icons/bi";
import { FiShield } from "react-icons/fi";
import { GiSwordSpade } from "react-icons/gi";
import { GrLocation } from "react-icons/gr";
import {
  MdOutlineCancel,
  MdOutlineEdit,
  MdOutlineSchedule,
  MdOutlineUpcoming,
  MdOutlineVisibility,
  MdVisibility,
} from "react-icons/md";
import { LiaTimesCircleSolid } from "react-icons/lia";
import { Link, useNavigate } from "react-router";
import { MatchRequestsContext } from "../contexts/MatchRequestsContext";

import { DateInput, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";

import { toast } from "react-toastify";
import { TeamContext } from "../contexts/TeamContext";

interface teamProps {
  createdAt: string;
  description: string;
  email: string;
  location: string;
  logo_url: string;
  name: string;
  skill_level: string;
}

interface matchRequestProps {
  id: number;
  created_at: string;
  date: string;
  location: string;
  message: string;
  status: string;
  team_id: number;
  team_name: string;
  time: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [team, setTeam] = useState<teamProps | []>([]);
  const teamContext = useContext(TeamContext);
  if (!teamContext) throw new Error("Cannot get team context");
  const { teamDetails, getTeamDetails } = teamContext;
  const matchRequestsContext = useContext(MatchRequestsContext);
  if (!matchRequestsContext)
    throw new Error("Error getting match requests context");

  const {
    createNewMatchRequest,
    loading,
    deleteMatchRequest,
    editMatchRequest,
    getTeamMatchRequests,
    matchRequests,
    getAcceptedRequests,
    acceptedRequests,
    getAllChallenges,
    receivedChallenges,
    acceptMatchChallenge,
    rejectMatchChallenge,
    getSentChallenges,
    sentChallenges,
    loadChallenges,
    deleteSentChallenges,
  } = matchRequestsContext;
  const fetchTeamData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:3000/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const response = await res.data;
      setTeam(response.team_data);
      console.log(response);
    } catch (error) {
      console.error("Error getting team Details", error);
    }
  };

  useEffect(() => {
    fetchTeamData();
    getTeamMatchRequests();
    getAcceptedRequests();
    getTeamDetails();
    getAllChallenges();
    getSentChallenges();
  }, []);

  function convertTo12Hour(time24: any) {
    const [hours, minutes] = time24.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatted;
  }

  // create matchRequest
  const createMatchRequest = async (values: typeof matchRequestForm.values) => {
    try {
      const result = await createNewMatchRequest(
        values.location,
        values.date,
        values.time,
        values.message
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setOpened(false);
      matchRequestForm.reset();
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong");
    }
  };

  // delete match request
  const handleDeleteRequest = async (id: number) => {
    try {
      const result = await deleteMatchRequest(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong");
    }
  };

  // edit match request
  const openEditModal = (request) => {
    setEditingRequest(request);
    editMatchRequestForm.setValues({
      location: request.location || "",
      date: request.date || "",
      time: request.time || "",
      message: request.message || "",
    });
    setEditMode(true);
  };
  const handleEditRequest = async (
    values: typeof editMatchRequestForm.values
  ) => {
    const updates = {
      location: values.location,
      date: values.date,
      time: values.time,
      message: values.message,
    };
    const result = await editMatchRequest(editingRequest.id, updates);
    if (result.success) {
      toast.success(result.message);
      setEditMode(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleAcceptChallenge = async (id: number) => {
    try {
      const result = await acceptMatchChallenge(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong");
    }
  };

  const handleRejectChallenge = async (id: number) => {
    try {
      const result = await rejectMatchChallenge(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong");
    }
  };

  // delete or cancel sent challenges
  const handleDeleteSentChallenge = async (id: number) => {
    try {
      const result = await deleteSentChallenges(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Something went wrong", error);
    }
  };

  const matchRequestForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      location: "",
      date: "",
      time: "",
      message: "",
    },

    validate: {
      location: (value) =>
        !value
          ? "This field cannot be empty"
          : value.length < 5
          ? "Cannot be less than 5 characters"
          : null,
      date: (value) => (!value ? "This field cannot be empty" : null),
      time: (value) => (!value ? "This field cannot be empty" : null),
      message: (value) =>
        !value
          ? "This field cannot be empty"
          : value.length < 20
          ? "Should not be less than 20 characters"
          : null,
    },

    validateInputOnChange: true,
  });

  // edit match request form validate
  const editMatchRequestForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      location: "",
      date: "",
      time: "",
      message: "",
    },

    validate: {
      location: (value) =>
        !value
          ? "This field cannot be empty"
          : value.length < 5
          ? "Cannot be less than 5 characters"
          : null,
      date: (value) => (!value ? "This field cannot be empty" : null),
      time: (value) => (!value ? "This field cannot be empty" : null),
      message: (value) =>
        !value
          ? "This field cannot be empty"
          : value.length < 20
          ? "Should not be less than 20 characters"
          : null,
    },

    validateInputOnChange: true,
  });

  return (
    <div className="pt-16 px-1 md:px-5 lg:px-5 pb-5">
      <main className="layout-container flex h-full grow flex-col">
        <div className="px-10 flex flex-1 justify-center py-10">
          <div className="layout-content-container flex w-full max-w-7xl flex-1 gap-8">
            <aside className="flex w-full max-w-xs flex-col gap-8">
              <div className="flex flex-col gap-4 items-start bg-[#192633] p-6 rounded-xl shadow-lg">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-2 border-primary"
                  data-alt={`${teamDetails?.name} logo`}
                  style={{
                    backgroundImage: "url('/emblem.png')",
                  }}
                ></div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-whit capitalizee text-[22px] font-bold leading-tight tracking-[-0.015em]">
                    {teamDetails?.name || `Team ${teamDetails?.id}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#92adc9]">
                      <GrLocation />
                    </span>
                    <p className="text-[#92adc9] capitalize text-sm font-normal leading-normal">
                      {teamDetails?.location ?? `Unknown location`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#92adc9]">
                      <FiShield />
                    </span>
                    <p className="text-[#92adc9] capitalize text-sm font-normal leading-normal">
                      Skill Level: {teamDetails?.skill_level ?? "Pro"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-stretch">
                <Button
                  onClick={() => setOpened(true)}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full transition-transform"
                >
                  <span className="truncate">Create New Match Request</span>
                </Button>

                <Button
                  onClick={() => navigate("/teams")}
                  bg={"gray"}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 text-white text-base font-bold leading-normal tracking-[0.015em] w-full transition-colors hover:bg-[#344a61]"
                >
                  <span className="truncate">View All Teams</span>
                </Button>

                <Button
                  onClick={() => navigate("/match-requests")}
                  bg={"gray"}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#233648] text-white text-base font-bold leading-normal tracking-[0.015em] w-full transition-colors hover:bg-[#344a61]"
                >
                  <span className="truncate">View All Match Requests</span>
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                  Recent Activity
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    className="flex items-start gap-4 p-4 rounded-lg bg-[#192633] hover:bg-[#233648] transition-colors group"
                    href="#"
                  >
                    <div className="flex items-center justify-center size-8 bg-green-500/20 rounded-full text-green-400 mt-1">
                      <span className="material-symbols-outlined text-base">
                        <BiCheckCircle />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white text-sm font-medium">
                        Your match against
                        <span className="font-bold">FC Wanderers</span> was
                        accepted.
                      </p>
                      <p className="text-xs text-[#92adc9]">2 hours ago</p>
                    </div>
                  </a>
                  <a
                    className="flex items-start gap-4 p-4 rounded-lg bg-[#192633] hover:bg-[#233648] transition-colors group"
                    href="#"
                  >
                    <div className="flex items-center justify-center size-8 bg-blue-500/20 rounded-full text-blue-400 mt-1">
                      <span className="material-symbols-outlined text-base">
                        <GiSwordSpade />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white text-sm font-medium">
                        New challenge request from
                        <span className="font-bold">The Gunners</span>.
                      </p>
                      <p className="text-xs text-[#92adc9]">1 day ago</p>
                    </div>
                  </a>
                  <a
                    className="flex items-start gap-4 p-4 rounded-lg bg-[#192633] hover:bg-[#233648] transition-colors group"
                    href="#"
                  >
                    <div className="flex items-center justify-center size-8 bg-purple-500/20 rounded-full text-purple-400 mt-1">
                      <span className="material-symbols-outlined text-base">
                        <BiChat />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white text-sm font-medium">
                        New message from
                        <span className="font-bold">Ted L.</span> in team chat.
                      </p>
                      <p className="text-xs text-[#92adc9]">1 day ago</p>
                    </div>
                  </a>
                </div>
              </div>
            </aside>

            <div className="flex flex-1 flex-col gap-8">
              {/* get recived challenges */}

              <div className="flex flex-col gap-5">
                <h2 className="text-white flex items-center gap-1 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Incoming Match Challenges
                  <span className="bg-white text-xs text-[#192633] w-4 h-4 flex items-center justify-center rounded-full">
                    {receivedChallenges.length}
                  </span>
                </h2>
                {loadChallenges && (
                  <div className="h-[10vh] flex items-center justify-center">
                    <Loader size={20} />
                  </div>
                )}
                {receivedChallenges.length === 0 && (
                  <div className="h-[10vh] flex items-center justify-center">
                    <p>No received challenge</p>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {receivedChallenges.map((received) => (
                    <div className="flex items-center justify-between gap-6 rounded-xl bg-[#192633] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)] hover:bg-[#233648] transition-colors">
                      <div className="flex flex-1 flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-yellow-400 text-sm flex gap-1 items-center font-bold leading-normal">
                            PENDING CONFIRMATION
                          </p>
                          <p className="text-white text-lg font-bold leading-tight">
                            Date: {formatDate(received.date)} @{" "}
                            {convertTo12Hour(received.match_time)}
                          </p>
                          <p className="text-[#92adc9] text-sm font-normal leading-normal">
                            Location: {received.location}
                          </p>
                          <p className="text-[#92adc9] text-sm font-normal leading-normal">
                            Team Name:{" "}
                            <span className="text-yellow-400">
                              {received.team_name}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            loading={loading.acceptMatchChallenge}
                            onClick={() => handleAcceptChallenge(received.id)}
                            radius={"md"}
                            justify="center"
                            className="flex min-w-[84px]"
                            leftSection={<BiCheckCircle className="text-lg" />}
                          >
                            Accept
                          </Button>
                          <Button
                            loading={loading.rejectMatchChallenge}
                            onClick={() => handleRejectChallenge(received.id)}
                            color="red"
                            justify="center"
                            radius={"md"}
                            leftSection={
                              <LiaTimesCircleSolid className="text-lg" />
                            }
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#233648] text-white gap-2 text-sm font-medium leading-normal w-fit hover:bg-primary/50 transition-colors"
                          >
                            <span className="truncate">Reject</span>
                          </Button>
                        </div>
                      </div>
                      <div className="bg-[#2c3946] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)] rounded-xl flex flex-1 items-center justify-center">
                        <p className="text-gray-200 text-sm leading-normal">
                          &quot;{received.message}&quot;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* sent challenges */}
              <div className="flex flex-col gap-5">
                <h2 className="text-white flex items-center gap-1 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Sent Match Challenges
                  <span className="bg-white text-xs text-[#192633] w-4 h-4 flex items-center justify-center rounded-full">
                    {sentChallenges.length}
                  </span>
                </h2>
                {loadChallenges && (
                  <div className="h-[10vh] flex items-center justify-center">
                    <Loader size={20} />
                  </div>
                )}
                {sentChallenges.length === 0 && (
                  <div className="h-[10vh] flex items-center justify-center">
                    <p>No challenge sent</p>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {sentChallenges.map((sent) => (
                    <div className="flex items-center justify-between gap-6 rounded-xl bg-[#192633] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)] hover:bg-[#233648] transition-colors">
                      <div className="flex flex-1 flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-cyan-400 text-sm flex gap-1 items-center font-bold leading-normal">
                            AWAITING CONFIRMATION
                          </p>
                          <p className="text-white text-lg font-bold leading-tight">
                            Date: {formatDate(sent.date)} @{" "}
                            {convertTo12Hour(sent.match_time)}
                          </p>
                          <p className="text-[#92adc9] text-sm font-normal leading-normal">
                            Location: {sent.location}
                          </p>
                          <p className="text-[#92adc9] text-sm font-normal leading-normal">
                            Sent to:{" "}
                            <span className="text-yellow-400">
                              {sent.team2_name}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleDeleteSentChallenge(sent.id)}
                            justify="center"
                            radius={"md"}
                            variant="outline"
                            leftSection={
                              <MdOutlineCancel className="text-red-400 font-bold text-lg" />
                            }
                            color="red"
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-transparent gap-2 text-sm font-medium leading-normal w-fit hover:bg-red-400/10 transition-colors"
                          >
                            <span className="truncate">Cancel</span>
                          </Button>{" "}
                        </div>
                      </div>
                      <div className="bg-[#2c3946] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)] rounded-xl flex flex-1 items-center justify-center">
                        <p className="text-gray-200 text-sm leading-normal">
                          &quot;{sent.message}&quot;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming accepted */}

              <div className="flex flex-col gap-5">
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Upcoming Accepted Matches
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 rounded-xl bg-[#192633] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)]">
                    {loading.getAcceptedRequests && (
                      <div className="h-[10vh] flex items-center justify-center">
                        <Loader size={20} />
                      </div>
                    )}
                    {acceptedRequests.length === 0 && (
                      <div className="h-[10vh] flex items-center justify-center">
                        <p>No accepted match requests</p>
                      </div>
                    )}
                    {acceptedRequests.map((request) => (
                      <div className="flex items-center gap-4 border-b border-b-[#233648] pb-4">
                        <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-[#233648] min-w-[64px]">
                          <p className="text-white text-sm font-bold leading-normal uppercase">
                            NOV
                          </p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
                            04
                          </p>
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-white text-lg font-bold leading-tight">
                            vs {request.team_2_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-[#92adc9]">
                            <span className="material-symbols-outlined text-base">
                              <MdOutlineSchedule />
                            </span>
                            <span>
                              {formatDate(request.date)} @{" "}
                              {convertTo12Hour(request.time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#92adc9]">
                            <span className="material-symbols-outlined text-base">
                              <GrLocation />
                            </span>
                            <span>{request.location}</span>
                          </div>
                        </div>
                        <Button
                          justify="center"
                          leftSection={
                            <MdOutlineVisibility className="text-base" />
                          }
                          color="cyan"
                          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#233648] text-white gap-2 text-sm font-medium leading-normal w-fit hover:bg-primary transition-colors"
                        >
                          <span className="truncate">View Details</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    color="cyan"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#233648] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full transition-colors hover:bg-[#344a61]"
                  >
                    <span className="truncate">View All Accepted Matches</span>
                  </Button>
                </div>
              </div>

              {/* Received Match request */}

              <div className="flex flex-col gap-5">
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Incoming Match Requests
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 rounded-xl bg-[#192633] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)]">
                    {loading.getAcceptedRequests && (
                      <div className="h-[10vh] flex items-center justify-center">
                        <Loader size={20} />
                      </div>
                    )}
                    {acceptedRequests.length === 0 && (
                      <div className="h-[10vh] flex items-center justify-center">
                        <p>No team has accepted your request yet</p>
                      </div>
                    )}
                    {acceptedRequests.map((request) => (
                      <div className="flex items-center gap-4 border-b border-b-[#233648] pb-4">
                        <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-[#233648] min-w-[64px]">
                          <p className="text-white text-sm font-bold leading-normal uppercase">
                            NOV
                          </p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
                            04
                          </p>
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-white text-lg font-bold leading-tight">
                            vs {request.team_2_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-[#92adc9]">
                            <span className="material-symbols-outlined text-base">
                              <MdOutlineSchedule />
                            </span>
                            <span>
                              {formatDate(request.date)} @{" "}
                              {convertTo12Hour(request.time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#92adc9]">
                            <span className="material-symbols-outlined text-base">
                              <GrLocation />
                            </span>
                            <span>{request.location}</span>
                          </div>
                        </div>
                        <Button
                          justify="center"
                          leftSection={
                            <MdOutlineVisibility className="text-base" />
                          }
                          color="cyan"
                          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#233648] text-white gap-2 text-sm font-medium leading-normal w-fit hover:bg-primary transition-colors"
                        >
                          <span className="truncate">View Details</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    color="cyan"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#233648] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full transition-colors hover:bg-[#344a61]"
                  >
                    <span className="truncate">View All</span>
                  </Button>
                </div>
              </div>

              {/* My Match Requests */}
              <div className="flex flex-col gap-5">
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  My Match Requests
                </h2>
                <div className="flex flex-col gap-4">
                  {loading.getTeamMatchRequests && (
                    <div className="h-[10vh] flex justify-center items-center">
                      <Loader size={20} />
                    </div>
                  )}

                  {matchRequests?.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-6 rounded-xl bg-[#192633] p-5 shadow-[0_0_4px_rgba(0,0,0,0.1)] hover:bg-[#233648] transition-colors"
                    >
                      <div className="flex flex-[2_2_0px] flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-primary text-sm font-bold leading-normal">
                            AWAITING OPPONENT
                          </p>
                          <p className="text-white text-lg font-bold leading-tight">
                            Proposed Date: {formatDate(request.date)} @{" "}
                            {convertTo12Hour(request.time)}
                          </p>
                          <p className="text-[#92adc9] text-sm font-normal leading-normal">
                            Location: {request.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => openEditModal(request)}
                            justify="center"
                            radius={"md"}
                            leftSection={<MdOutlineEdit className="text-lg" />}
                            color="cyan"
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#233648] text-white gap-2 text-sm font-medium leading-normal w-fit hover:bg-primary/50 transition-colors"
                          >
                            <span className="truncate">Edit</span>
                          </Button>
                          <Button
                            onClick={() => handleDeleteRequest(request.id)}
                            justify="center"
                            radius={"md"}
                            variant="outline"
                            leftSection={
                              <MdOutlineCancel className="text-red-400 font-bold text-lg" />
                            }
                            color="red"
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-transparent gap-2 text-sm font-medium leading-normal w-fit hover:bg-red-400/10 transition-colors"
                          >
                            <span className="truncate">Cancel</span>
                          </Button>
                        </div>
                      </div>
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1 max-w-[200px]"
                        data-alt="Map showing the location of Regent's Park"
                        data-location="Regent's Park, London"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9iHetiFAGkEC-VpOt7YL9OVCS7rUwib8VH-v0x7A8zSS2ePt70XrFW7XsVjDfqEJKh5IMbJ0H3wHWSLEhwKav1IBwFIMTrvDwG8D2Zx5d23tNSsUBmW1-TFwxfwSjNIGGoGbnB4p_MxjNcgsfofvNgTyHwlKDdzrIDG_saz-JBAsiFwaLJ3PAEwuL7MkO6teDFXrWWBmBWJ1pXKsKD-tWXTnh2r2iGcmbX_AoUngDUZDeBTxqKnQy2GjtN5afT_VVVN1IPyAfSG4')",
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                {matchRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#233648] p-10 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#4a637d]">
                      <MdOutlineUpcoming />
                    </span>
                    <p className="text-white text-lg font-bold">
                      No other match requests
                    </p>
                    <p className="text-[#92adc9] text-sm max-w-sm">
                      You haven't created any other match requests yet. Click
                      the button below to challenge a new team!
                    </p>
                    <Button
                      onClick={() => setOpened(true)}
                      className="flex mt-2 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal w-fit transition-transform "
                    >
                      <span className="truncate">
                        Create Your First Request
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal
        title="Create New Match Request"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <form
          action=""
          onSubmit={matchRequestForm.onSubmit(createMatchRequest)}
        >
          <Stack gap={20}>
            <TextInput
              withAsterisk
              label="Location"
              placeholder="Eg. Nania Park, Legon"
              {...matchRequestForm.getInputProps("location")}
            />
            <DateInput
              label="Date"
              valueFormat="DD/MM/YY"
              placeholder="DD/MM/YY"
              withAsterisk
              clearable
              {...matchRequestForm.getInputProps("date")}
            />
            <TimeInput
              withAsterisk
              label="Time"
              {...matchRequestForm.getInputProps("time")}
            />
            <Textarea
              withAsterisk
              resize="vertical"
              label="Message"
              placeholder="Write a short message..."
              {...matchRequestForm.getInputProps("message")}
            />
            <Button loading={loading.createNewMatchRequest} type="submit">
              Create New Request
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        title="Edit Match Request"
        opened={editMode}
        onClose={() => setEditMode(false)}
      >
        <form
          action=""
          onSubmit={editMatchRequestForm.onSubmit(handleEditRequest)}
        >
          <Stack gap={20}>
            <TextInput
              withAsterisk
              label="Location"
              placeholder="Eg. Nania Park, Legon"
              {...editMatchRequestForm.getInputProps("location")}
            />
            <DateInput
              label="Date"
              valueFormat="DD/MM/YY"
              placeholder="DD/MM/YY"
              withAsterisk
              clearable
              {...editMatchRequestForm.getInputProps("date")}
            />
            <TimeInput
              withAsterisk
              label="Time"
              {...editMatchRequestForm.getInputProps("time")}
            />
            <Textarea
              withAsterisk
              resize="vertical"
              label="Message"
              placeholder="Write a short message..."
              {...editMatchRequestForm.getInputProps("message")}
            />
            <Button loading={loading.editMatchRequest} type="submit">
              Edit Request
            </Button>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
