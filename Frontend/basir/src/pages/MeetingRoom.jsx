///now i am going to wrting the code for the navbar and all data
///now i am going to wrting the code for the navbar and all data
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

import { ZEGO_APP_ID, ZEGO_SERVER_SECRET } from "../config/zego";
import sessionApi from "../config/sessionApi";
import { FaChalkboard, FaTimes, FaBrain, FaHistory } from "react-icons/fa";
import Whiteboard from "../components/whiteboard/Whiteboard";
import socket, { joinRoomOnConnect } from "../config/socket";
import quizApi from "../config/quizApi";
import AIQuizModal from "../components/quiz/AIQuizModal";
import QuizNotificationToast from "../components/quiz/QuizNotificationToast";
import ExamInterface from "../components/quiz/ExamInterface";
import QuizResultsView from "../components/quiz/QuizResultsView";
import LeaderboardView from "../components/quiz/LeaderboardView";
import HostQuizDashboard from "../components/quiz/HostQuizDashboard";
import QuizHistory from "../components/quiz/QuizHistory";
import api from "../config/Api";

function MeetingRoom() {
  const { roomId } = useParams();

  const navigate = useNavigate();

  const meetingRef = useRef(null);

  const [user, setUser] = useState(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  // ---- AI Quiz state ----
  const [isHost, setIsHost] = useState(false);
  const [showAIQuizModal, setShowAIQuizModal] = useState(false);
  const [showQuizHistory, setShowQuizHistory] = useState(false);
  const [quizNotification, setQuizNotification] = useState(null);
  const [examQuizId, setExamQuizId] = useState(null);
  const [resultAttempt, setResultAttempt] = useState(null);
  const [resultQuizId, setResultQuizId] = useState(null);
  const [leaderboardQuizId, setLeaderboardQuizId] = useState(null);
  const [hostDashboardQuizId, setHostDashboardQuizId] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user && roomId) {
      startMeeting();
      checkHostStatus();
    }
  }, [user, roomId]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribeJoin = joinRoomOnConnect("quiz:join", roomId);

    const onQuizStarted = (payload) => {
      if (payload.roomId !== roomId) return;
      setQuizNotification(payload);
    };

    const onQuizEnded = (payload) => {
      setQuizNotification((prev) =>
        prev?.quizId === payload.quizId ? null : prev,
      );
    };

    socket.on("quiz:started", onQuizStarted);
    socket.on("quiz:ended", onQuizEnded);

    quizApi
      .get(`/room/${roomId}/active`)
      .then((res) => {
        if (res.data?.quiz) setQuizNotification(res.data.quiz);
      })
      .catch((err) => console.log(err));

    return () => {
      socket.emit("quiz:leave", roomId);
      socket.off("quiz:started", onQuizStarted);
      socket.off("quiz:ended", onQuizEnded);
      unsubscribeJoin();
    };
  }, [roomId]);

  const getUser = async () => {
    try {
      const res = await api.get("/alldata");
      setUser(res.data.sabdata);
    } catch (error) {
      console.log(error);
    }
  };

  const checkHostStatus = async () => {
    try {
      const res = await sessionApi.get(`/${roomId}`);
      setIsHost(res.data.session.host._id === user._id);
    } catch (error) {
      console.log(error);
    }
  };

  const startMeeting = async () => {
    try {
      const userID = user?._id || `guest-${roomId}-${Date.now()}`;

      const userName = user?.name || "Guest";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        ZEGO_APP_ID,
        ZEGO_SERVER_SECRET,
        roomId,
        userID,
        userName,
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: meetingRef.current,

        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },

        sharedLinks: [
          {
            name: "Meeting Link",
            url: window.location.href,
          },
        ],

        showScreenSharingButton: true,

        showTextChat: true,

        showUserList: true,

        showRoomDetailsButton: true,

        showLayoutButton: true,

        showPreJoinView: false,
        turnOnCameraWhenJoining: true,

        turnOnMicrophoneWhenJoining: true,

        onLeaveRoom: () => {
          navigate("/dashboard");
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const endMeeting = async () => {
    try {
      await sessionApi.post(`/end/${roomId}`);

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      navigate("/dashboard");
    }
  };

  // ---- AI Quiz handlers ----
  const handleQuizPublished = (quiz) => {
    setShowAIQuizModal(false);
    setHostDashboardQuizId(quiz._id);
  };

  const handleAttendQuiz = () => {
    if (!quizNotification) return;
    setExamQuizId(quizNotification.quizId);
    setQuizNotification(null);
  };

  const handleQuizSubmitted = (attempt) => {
    setExamQuizId(null);
    setResultAttempt(attempt);
    setResultQuizId(attempt.quiz);
  };

  const handleEndQuiz = async (quizId) => {
    try {
      await quizApi.post(`/${quizId}/end`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div ref={meetingRef} className="w-full h-screen" />

      {!whiteboardOpen && (
        <button
          onClick={() => setWhiteboardOpen(true)}
          title="Open Whiteboard"
          className="fixed bottom-24 right-6 z-[140] w-14 h-14 flex items-center justify-center rounded-2xl
            bg-gradient-to-br from-cyan-300 to-violet-300 text-[#05070d] shadow-[0_10px_40px_-8px_rgba(34,211,238,0.6)]
            hover:scale-105 transition-transform"
        >
          <FaChalkboard size={20} />
        </button>
      )}

      {whiteboardOpen && (
        <Whiteboard roomId={roomId} onClose={() => setWhiteboardOpen(false)} />
      )}

      {/* AI Quiz — host trigger */}
      {isHost && (
        <button
          onClick={() => setShowAIQuizModal(true)}
          title="AI Quiz"
          className="fixed bottom-44 right-6 z-[140] w-14 h-14 flex items-center justify-center rounded-2xl
            bg-gradient-to-br from-emerald-300 to-cyan-400 text-[#05070d] shadow-[0_10px_40px_-8px_rgba(52,211,153,0.6)]
            hover:scale-105 transition-transform"
        >
          <FaBrain size={20} />
        </button>
      )}

      {/* Quiz History — everyone */}
      <button
        onClick={() => setShowQuizHistory(true)}
        title="Quiz History"
        className="fixed bottom-[172px] right-24 z-[140] w-11 h-11 flex items-center justify-center rounded-xl
          bg-white/10 text-white backdrop-blur border border-white/10 hover:bg-white/20 transition-colors"
      >
        <FaHistory size={16} />
      </button>

      {showAIQuizModal && (
        <AIQuizModal
          roomId={roomId}
          onClose={() => setShowAIQuizModal(false)}
          onQuizPublished={handleQuizPublished}
        />
      )}

      {quizNotification && !isHost && (
        <QuizNotificationToast
          quizInfo={quizNotification}
          onAttend={handleAttendQuiz}
          onDismiss={() => setQuizNotification(null)}
        />
      )}

      {examQuizId && (
        <ExamInterface
          quizId={examQuizId}
          onExit={() => setExamQuizId(null)}
          onSubmitted={handleQuizSubmitted}
        />
      )}

      {resultAttempt && (
        <QuizResultsView
          attempt={resultAttempt}
          showLeaderboard={true}
          onViewLeaderboard={() => setLeaderboardQuizId(resultQuizId)}
          onClose={() => {
            setResultAttempt(null);
            setResultQuizId(null);
          }}
        />
      )}

      {leaderboardQuizId && (
        <LeaderboardView
          quizId={leaderboardQuizId}
          currentUserId={user?._id}
          onClose={() => setLeaderboardQuizId(null)}
        />
      )}

      {hostDashboardQuizId && (
        <HostQuizDashboard
          quizId={hostDashboardQuizId}
          onClose={() => setHostDashboardQuizId(null)}
          onEndQuiz={handleEndQuiz}
        />
      )}

      {showQuizHistory && (
        <QuizHistory
          roomId={roomId}
          isHost={isHost}
          onClose={() => setShowQuizHistory(false)}
          onOpenDashboard={(quizId) => {
            setShowQuizHistory(false);
            setHostDashboardQuizId(quizId);
          }}
        />
      )}
    </>
  );
}

export default MeetingRoom;
