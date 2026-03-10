import { useEffect, useMemo, useRef } from "react";
import { Message } from "../chat/page";
import { User } from "../context/AppContext";
import moment from "moment";
import { CheckCheck } from "lucide-react";

export interface ChatMessageProps {
  selecteduser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

export default function ChatMessages({
  selecteduser,
  messages,
  loggedInUser,
}: ChatMessageProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Remove duplicate messages
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];

    const seen = new Set<string>();

    return messages.filter((msg) => {
      if (seen.has(msg._id)) return false;
      seen.add(msg._id);
      return true;
    });
  }, [messages]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selecteduser, uniqueMessages]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-h-[calc(100vh-215px)] overflow-y-auto p-2 space-y-2 custom-scroll">
        {!selecteduser ? (
          <p className="text-gray-400 text-center mt-20">
            Please select user to start conversation 💬
          </p>
        ) : (
          <>
            {uniqueMessages.map((msg) => {
              const isSentByMe = msg.sender === loggedInUser?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col gap-1 mt-2 ${
                    isSentByMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg p-2 max-w-sm ${
                      isSentByMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {/* Image message */}
                    {msg.messageType === "image" && msg.image && (
                      <div className="relative group">
                        <img
                          src={msg.image.url}
                          alt="shared"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}

                    {/* Text message */}
                    {msg.text && <p className="mt-1">{msg.text}</p>}
                  </div>

                  {/* Message time + seen */}
                  <div
                    className={`flex items-center gap-1 text-xs text-gray-400 ${
                      isSentByMe ? "pr-2 flex-row-reverse" : "pl-2"
                    }`}
                  >
                    <span>
                      {moment(msg.createdAt).format("hh:mm A • MMM D")}
                    </span>

                    {isSentByMe && (
                      <div className="flex items-center ml-1">
                        {msg.seen ? (
                          <div className="flex items-center gap-1 text-blue-400">
                            <CheckCheck className="w-3 h-3" />
                            {msg.seenAt && (
                              <span>
                                {moment(msg.seenAt).format("hh:mm A")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <CheckCheck className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Auto scroll anchor */}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}