import { Button, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiSearch, BiUserPin } from "react-icons/bi";
import { BsStar } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import { FiRefreshCw } from "react-icons/fi";
import { MatchRequestsContext } from "../contexts/MatchRequestsContext";
import { TeamContext } from "../contexts/TeamContext";
import { useForm } from "@mantine/form";
import { DateInput, TimeInput } from "@mantine/dates";
import { toast } from "react-toastify";

interface teamProps {
  id: number;
  createdAt: string;
  description: string;
  email: string;
  location: string;
  logo_url: string;
  name: string;
  skill_level: string;
}

const AllTeams = () => {
  const [teams, setTeams] = useState([]);
  const [opened, setOpened] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onLoad, setLoading] = useState(false);
  const matchRequestsContext = useContext(MatchRequestsContext);
  if (!matchRequestsContext)
    throw new Error("Cannot get match request context");
  const {
    getAllChallenges,
    createNewMatchChallenge,
    loading,
    sentChallenges,
    getSentChallenges,
  } = matchRequestsContext;
  const teamContext = useContext(TeamContext);
  if (!teamContext) throw new Error("Cannot get team context");
  const { teamDetails, getTeamDetails } = teamContext;
  const [receiverId, setReceiverId] = useState<number | null>(null);

  const team1_Id = teamDetails?.id;

  const form = useForm({
    mode: "uncontrolled",

    initialValues: {
      date: "",
      location: "",
      message: "",
      match_time: "",
    },

    validate: {
      location: (value) =>
        !value
          ? "This field cannot be empty"
          : value.length < 5
          ? "Cannot be less than 5 characters"
          : null,
      date: (value) => (!value ? "This field cannot be empty" : null),
      match_time: (value) => (!value ? "This field cannot be empty" : null),
      message: (value) =>
        !value
          ? "This field cannot be empty"
          : value.length < 20
          ? "Should not be less than 20 characters"
          : null,
    },

    validateInputOnChange: true,
  });

  const fetchTeams = async () => {
    try {
      const getTeams = await axios.get("http://localhost:3000/teams");
      const result = await getTeams.data;
      setTeams(result.teams);
      console.log(result.teams);
    } catch (error) {
      console.log("Error getting teams", error);
      setErrorMessage("Error getting Teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewChallenge = async (values: typeof form.values) => {
    if (receiverId === null) {
      toast.error("No receiver selected");
      return;
    }
    try {
      const result = await createNewMatchChallenge(
        values.date,
        values.location,
        values.message,
        values.match_time,
        team1_Id,
        receiverId
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setOpened(false);
      form.reset();
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong, try again");
    }
  };

  const openSendChallengeModal = (team: { id: number }) => {
    setReceiverId(team.id);
    setOpened(true);
  };

  useEffect(() => {
    setLoading(true);
    fetchTeams();
    getAllChallenges();
    getTeamDetails();
    getSentChallenges();
  }, []);

  return (
    <main className="flex flex-col pt-24 px-5 gap-5 md:px-5 lg:px-5 pb-5">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="grow w-full flex justify-center">
          <label className="flex flex-col min-w-40 h-12 w-full md:w-1/2">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#92adc9] flex border-none bg-[#233648] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-2xl">
                  <BiSearch />
                </span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#233648] focus:border-none h-full placeholder:text-[#92adc9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Search by team name..."
                value=""
              />
            </div>
          </label>
        </div>
      </div>
      {onLoad && (
        <div className="flex items-center justify-center gap-3 h-[50vh]">
          <p>Loading teams...</p>
          <AiOutlineLoading3Quarters className="animate-spin" />
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center justify-center gap-3 h-[50vh]">
          <p>{errorMessage}</p>
          <div
            onClick={fetchTeams}
            className="bg-green-600 p-1.5 text-white rounded-full cursor-pointer"
          >
            <FiRefreshCw />
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6 place-items-center mt-10">
        {!onLoad &&
          !errorMessage &&
          teams.length > 0 &&
          teams.map((team: teamProps) => {
            const hasSent = sentChallenges.find(
              (sent) => sent.team2_id === team.id
            );
            return (
              <div
                key={team.id}
                className="flex flex-col gap-4 p-4 rounded-xl bg-[#1A2836] border border-[#233648] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                    data-alt="Coastal United team logo"
                    style={{
                      backgroundImage: 'url("/emblem.png")',
                    }}
                  ></div>
                  <div className="grow">
                    <p className="text-white capitalize text-lg font-bold leading-normal">
                      {team.name || `Team ${team.id}`}
                    </p>
                    <div className="flex items-center gap-1 text-[#92adc9]">
                      <span className="material-symbols-outlined text-sm">
                        <CiLocationOn />
                      </span>
                      <p className="text-sm font-normal leading-normal">
                        {team.location || `Unknown location`}
                      </p>
                    </div>
                    {team1_Id === team.id ? (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="material-symbols-outlined text-sm">
                          <BiUserPin />
                        </span>
                        <p className="text-sm font-normal leading-normal">
                          Admin
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={`flex items-center capitalize gap-1 px-2 py-1 rounded-full ${
                      team.skill_level === "beginner"
                        ? "bg-green-700/10"
                        : team.skill_level === "intermediate"
                        ? "bg-yellow-400/10"
                        : "bg-blue-700/10"
                    } ${
                      team.skill_level === "beginner"
                        ? "text-green-700"
                        : team.skill_level === "intermediate"
                        ? "text-yellow-400"
                        : "text-blue-700"
                    } text-xs font-bold`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      <BsStar />
                    </span>
                    <span>{team.skill_level}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      openSendChallengeModal(team);
                    }}
                    disabled={team.id === teamDetails?.id || hasSent}
                    className=""
                  >
                    {hasSent ? "Challenge sent" : "Send Challenge"}
                  </Button>
                  <Button
                    bg={"cyan"}
                    className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#233648] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      <Modal
        title="Send a Challenge"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <form action="" onSubmit={form.onSubmit(handleCreateNewChallenge)}>
          <Stack gap={20}>
            <TextInput
              withAsterisk
              label="Location"
              placeholder="Eg. Nania Park, Legon"
              {...form.getInputProps("location")}
            />
            <DateInput
              label="Date"
              withAsterisk
              valueFormat="DD/MM/YY"
              placeholder="DD/MM/YY"
              {...form.getInputProps("date")}
            />
            <TimeInput
              withAsterisk
              label="Time"
              {...form.getInputProps("match_time")}
            />
            <Textarea
              placeholder="Write a short message..."
              withAsterisk
              resize="vertical"
              label="Message"
              {...form.getInputProps("message")}
            />
            <Button type="submit" loading={loading.createNewMatchChallenge}>
              Send Challenge
            </Button>
          </Stack>
        </form>
      </Modal>
    </main>
  );
};

export default AllTeams;
