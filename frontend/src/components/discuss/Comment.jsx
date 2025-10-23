import React, { useState, memo } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Trash,
  Reply,
  ChevronUp,
  ChevronDown,
  Clock,
  Send,
  Edit,
} from "lucide-react";
import { useSelector } from "react-redux";
import axiosClient from "../../utils/axiosClient";
import { useToast } from "../../hooks/useToast";

const Comment = memo(
  ({
    comment,
    discussionId,
    onCommentUpdate,
    onCommentDelete,
    isReply = false,
  }) => {


  const { user } = useSelector(state => state.auth);
  const { showToast } = useToast();

  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Check if user has upvoted
    const hasUpvoted = () => {
      return user && comment.upvotes?.includes(user._id);
    };

    // Check if user has downvoted
    const hasDownvoted = () => {
      return user && comment.downvotes?.includes(user._id);
    };

    // Check if user is the author
    const isAuthor = () => {
      return user && user._id === comment.author?._id;
    };

    // Handle comment vote
    const handleVote = async (type) => {
      if (!user) {
        showToast("Please log in to vote", "warning");
        return;
      }

      try {
        const response = await axiosClient.post(
          `/discussions/comments/${comment._id}/vote`,
          { voteType: type }
        );

        // Update comment with new vote arrays (not counts)
        if (response.data.success) {
          onCommentUpdate({
            ...comment,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes,
          });
        }
      } catch (error) {
        console.error("Error voting on comment:", error);
        const errorMessage = error.response?.data?.message || "Failed to register vote";
        showToast(errorMessage, "error");
      }
    };

    // Handle reply submission
    const handleReplySubmit = async (e) => {
      e.preventDefault();

      if (!replyText.trim()) return;

      try {
        const response = await axiosClient.post(
          `/discussions/${discussionId}/comments`,
          {
            content: replyText,
            parentComment: comment._id,
          }
        );

        // Add reply to parent comment
        const updatedComment = { ...comment };
        if (!updatedComment.replies) {
          updatedComment.replies = [];
        }
        updatedComment.replies.push(response.data);

        onCommentUpdate(updatedComment);
        setReplyText(""); // Clear input
        setReplyingTo(false); // Close reply form
        setShowReplies(true); // Show replies after adding a new one
        showToast("Reply added successfully", "success");
      } catch (error) {
        console.error("Error adding reply:", error);
        showToast("Failed to add reply", "error");
      }
    };

    // Handle comment delete
    const handleDelete = async () => {
      try {
        await axiosClient.delete(`/discussions/comments/${comment._id}`);
        onCommentDelete(comment._id);
        showToast("Comment deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting comment:", error);
        showToast("Failed to delete comment", "error");
      }
    };

    // Handle comment edit submit
    const handleEditSubmit = async (e) => {
      e.preventDefault();

      if (!editText.trim()) {
        showToast("Comment cannot be empty", "warning");
        return;
      }

      try {
        const response = await axiosClient.put(
          `/discussions/comments/${comment._id}`,
          { content: editText }
        );

        if (response.data.success) {
          onCommentUpdate(response.data.comment);
          setIsEditing(false);
          showToast("Comment updated successfully", "success");
        }
      } catch (error) {
        console.error("Error updating comment:", error);
        showToast("Failed to update comment", "error");
      }
    };

    return (
      <div
        className={`${
          isReply
            ? "ml-8 mt-3 border-l-2 border-gray-700 pl-4"
            : "border border-gray-700/50 rounded-xl p-4 mb-4"
        }`}
      >
        <div className="flex justify-between">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden mr-2">
              {comment.author?.profileImage ? (
                <img
                  src={comment.author.profileImage}
                  alt={comment.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-xs font-bold">
                  {comment.author?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-white">
                {(comment.author?.name && comment.author?.name !== "Anonymous") ? comment.author.name : (user ? user.name : "Anonymous")}
                {isAuthor() && (
                  <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                    Author
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(comment.createdAt)}
              </div>
            </div>
          </div>

          {isAuthor() && !isEditing && (
            <div className="relative group">
              <button className="text-gray-400 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="mb-3">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
            <div className="flex justify-end mt-1 space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.content);
                }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="text-gray-200 mb-3">{comment.content}</div>
        )}

        <div className="flex items-center text-sm">
          <button
            onClick={() => handleVote("upvote")}
            className={`flex items-center mr-3 ${
              hasUpvoted()
                ? "text-orange-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span>{comment.upvotes?.length || 0}</span>
          </button>

          <button
            onClick={() => handleVote("downvote")}
            className={`flex items-center mr-4 ${
              hasDownvoted()
                ? "text-orange-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            <span>{comment.downvotes?.length || 0}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setReplyingTo(!replyingTo)}
              className="text-gray-400 hover:text-white flex items-center mr-4"
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </button>
          )}

          {!isReply && comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-400 hover:text-white flex items-center"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Replies ({comment.replies.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Replies ({comment.replies.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Reply form */}
        {replyingTo && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <div className="flex">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-r-md transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Nested replies */}
        {!isReply &&
          comment.replies &&
          comment.replies.length > 0 &&
          showReplies && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  discussionId={discussionId}
                  onCommentUpdate={(updatedReply) => {
                    const updatedReplies = comment.replies.map((r) =>
                      r._id === updatedReply._id ? updatedReply : r
                    );
                    onCommentUpdate({
                      ...comment,
                      replies: updatedReplies,
                    });
                  }}
                  onCommentDelete={(replyId) => {
                    const updatedReplies = comment.replies.filter(
                      (r) => r._id !== replyId
                    );
                    onCommentUpdate({
                      ...comment,
                      replies: updatedReplies,
                    });
                  }}
                  isReply={true}
                />
              ))}
            </div>
          )}
      </div>
    );
  }
);

export default Comment;
