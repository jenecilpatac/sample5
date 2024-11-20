import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { PencilIcon } from "@heroicons/react/24/solid";
import EditStockModalSuccess from "./EditStockModalSuccess";
import BeatLoader from "react-spinners/BeatLoader";
import Avatar from "../assets/avatar.png";
import PrintCash from "../PrintCash";
import AddCustomModal from "../EditCustomModal";

type Props = {
  closeModal: () => void;
  record: Record;
  refreshData: () => void;
};

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
}

type Record = {
  id: number;
  request_code: string;
  created_at: Date;
  status: string;
  approvers_id: number;
  form_data: FormData[];
  supplier?: string;
  address?: string;
  branch: string;
  date: string;
  user_id: number;
  attachment: string;
  noted_by: {
    id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];
  approved_by: {
    id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];
};

type FormData = {
  approvers_id: number;
  attachment: string;
  purpose: string;
  items: Item[];
  branch: string;
  date: string;
  grand_total: string;
  supplier: string;
  address: string;
  totalBoatFare: string;
  totalContingency: string;
  totalFare: string;
  totalHotel: string;
  totalperDiem: string;
  totalExpense: string;
  short: string;
};

// Define the Item type
type Item = {
  cashDate: string;
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
  day: string;
  from: string;
  to: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
};

const headerStyle = "border border-black bg-[#8EC7F7] w-2/12 text-sm p-2";
const inputStyle = "border border-black text-[12px] font-bold";
const tableStyle = "border border-black px-1";
const tableCellStyle = `${inputStyle} py-2 px-1 w-10 wrap-text  break-words`;
const ViewCashAdvanceModal: React.FC<Props> = ({
  closeModal,
  record,
  refreshData,
}) => {
  const [editableRecord, setEditableRecord] = useState(record);
  const [newData, setNewData] = useState<Item[]>([]);
  const [newTotalBoatFare, setNewTotalBoatFare] = useState("");
  const [newTotalHotel, setNewTotalHotel] = useState("");
  const [newTotalFare, setNewTotalFare] = useState("");
  const [newTotalContingency, setNewTotalContingency] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState("");
  const [editedApprovers, setEditedApprovers] = useState<number>(
    record.approvers_id
  );
  const [loading, setLoading] = useState(false);
  const [fetchingApprovers, setFetchingApprovers] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingApprovers, setIsFetchingApprovers] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [user, setUser] = useState<any>({});
  const [attachmentUrl, setAttachmentUrl] = useState<string[]>([]);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<
    Array<string | number>
  >([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const hasDisapprovedInNotedBy = notedBy.some(
    (user) => user.status === "Disapproved"
  );
  const hasDisapprovedInApprovedBy = approvedBy.some(
    (user) => user.status === "Disapproved"
  );
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const longPressTimeout = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;

        // Create a mapping of id to branch_name
        const branchMapping = new Map<number, string>(
          branches.map((branch: { id: number; branch_code: string }) => [
            branch.id,
            branch.branch_code,
          ])
        );

        setBranchList(branches);
        setBranchMap(branchMapping);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);
  // Get branch ID from record
  const branchId = parseInt(record.form_data[0].branch, 10);
  // Get branch name or default to "Unknown"
  const branchName = branchMap.get(branchId) || "Unknown";

  useEffect(() => {
    const currentUserId = localStorage.getItem("id");
    setNotedBy(editableRecord.noted_by);
    setApprovedBy(editableRecord.approved_by);
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord(record);
    setNewTotalBoatFare(record.form_data[0].totalBoatFare);
    setNewTotalHotel(record.form_data[0].totalHotel);
    setNewTotalFare(record.form_data[0].totalFare);
    setNewTotalContingency(record.form_data[0].totalContingency);
    setEditedApprovers(record.approvers_id);
    if (currentUserId) {
      fetchUser(record.user_id);
    }
    try {
      if (typeof record.attachment === "string") {
        // Parse the JSON string if it contains the file path
        const parsedAttachment: string[] = JSON.parse(record.attachment);

        if (parsedAttachment.length > 0) {
          // Construct file URLs
          const fileUrls = parsedAttachment.map(
            (filePath) =>
              `${process.env.REACT_APP_URL_STORAGE}/${filePath.replace(
                /\\/g,
                "/"
              )}`
          );
          setAttachmentUrl(fileUrls);
        }
      }
    } catch (error) {
      console.error("Error parsing attachment:", error);
    }
  }, [record]);

  const fetchUser = async (id: number) => {
    setIsFetchingUser(true);
    setIsFetchingApprovers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
    } finally {
      setIsFetchingUser(false);
      setIsFetchingApprovers(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAttachmentUrl(attachmentUrl);
    setNewAttachments([]); // Clear new attachments
    setRemovedAttachments([]);
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditedApprovers(record.approvers_id);
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: record.form_data[0].grand_total, // Reset grand_total
        },
      ],
    }));
  };

  const calculateGrandTotal = () => {
    let total = 0;
    total += parseFloat(newTotalBoatFare);
    // total += parseFloat(newTotalHotel);
    total += newData.reduce(
      (totalHotelRate, item) => totalHotelRate + Number(item.rate),
      0
    );
    total += parseFloat(newTotalFare);
    total += parseFloat(newTotalContingency);
    total += newData.reduce(
      (totalPerDiem, item) => totalPerDiem + Number(item.perDiem),
      0
    );
    return parseFloat(total.toString()).toFixed(2);
  };
  const handleEdit = () => {
    setEditedDate(editableRecord.form_data[0].date);
    setNewTotalBoatFare(editableRecord.form_data[0].totalBoatFare);
    setNewTotalHotel(editableRecord.form_data[0].totalHotel);
    setNewTotalFare(editableRecord.form_data[0].totalFare);
    setNewTotalContingency(editableRecord.form_data[0].totalContingency);
    setIsEditing(true);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewAttachments((prevImages) => [...prevImages, ...files]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    setNewAttachments((prevImages) => [...prevImages, ...droppedFiles]);
    setIsHovering(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleRemoveImage = (imageName: string) => {
    setNewAttachments((prevImages) =>
      prevImages.filter((image) => image.name !== imageName)
    );
  };

  const handleRemoveAttachment = (index: number) => {
    // Get the path of the attachment to be removed
    const attachmentPath = attachmentUrl[index].split(
      "request-form-files/request_form_attachments/"
    )[1];

    // Add the path to the removedAttachments state
    setRemovedAttachments((prevRemoved) => [...prevRemoved, attachmentPath]);

    // Remove the attachment from the current list
    setAttachmentUrl((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  const formatDate2 = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  if (!record) return null;

  const handleSaveChanges = async () => {
    // Simple validation
    if (
      !newData.every(
        (item) =>
          item.from &&
          item.from.trim() !== "" &&
          item.to &&
          item.to.trim() !== "" &&
          item.cashDate &&
          item.cashDate.trim() !== ""
      )
    ) {
      setErrorMessage("From, to and date cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Token is missing");
        return;
      }

      const formData = new FormData();
      formData.append("updated_at", new Date().toISOString());
      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));

      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: editableRecord.form_data[0].branch,
            date: editedDate !== "" ? editedDate : editableRecord.created_at,
            status: editableRecord.status,
            grand_total: calculateGrandTotal(),
            items: newData,
            totalBoatFare: newTotalBoatFare,
            totalHotel: newTotalHotel,
            totalFare: newTotalFare,
            totalContingency: newTotalContingency,
          },
        ])
      );

      // Append existing attachments
      attachmentUrl.forEach((url, index) => {
        const path = url.split(
          "request-form-files/request_form_attachments/"
        )[1];
        formData.append(`attachment_url_${index}`, path);
      });

      // Append new attachments
      newAttachments.forEach((file, index) => {
        formData.append("new_attachments[]", file);
      });

      // Append removed attachments
      removedAttachments.forEach((path, index) => {
        formData.append("removed_attachments[]", String(path));
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/update-request/${record.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);
      setIsEditing(false);
      setSavedSuccessfully(true);
      refreshData();
    } catch (error: any) {
      setLoading(false);
      console.error("Validation error:", error.response?.data?.errors);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update Cash advance."
      );
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    const newDataCopy = [...newData];
    newDataCopy[index] = { ...newDataCopy[index], [field]: value };
    setErrorMessage("");

    // Calculate and update the 'Day' field if the 'Cash Date' changes
    if (field === "cashDate") {
      const date = new Date(value);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[date.getDay()];
      newDataCopy[index].day = day;
    }

    // Calculate totalAmount if either quantity or unitCost changes
    if (field === "quantity" || field === "unitCost") {
      const quantity = parseFloat(newDataCopy[index].quantity);
      const unitCost = parseFloat(newDataCopy[index].unitCost);
      newDataCopy[index].totalAmount = (quantity * unitCost).toString() === "NaN" ? "0" : parseFloat((quantity * unitCost).toString()).toFixed(2);
    }

    // Calculate grandTotal
    let total = 0;
    for (const item of newDataCopy) {
      total += parseFloat(item.totalAmount);
    }
    const grandTotal = parseFloat(total.toString()).toFixed(2);

    setNewData(newDataCopy);
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: grandTotal,
          date: editedDate !== "" ? editedDate : prevState.form_data[0].date,
        },
      ],
      approvers_id: editedApprovers,
    }));
  };

  const openAddCustomModal = () => {
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };

  const handleAddCustomData = (notedBy: Approver[], approvedBy: Approver[]) => {
    setNotedBy(notedBy);
    setApprovedBy(approvedBy);
  };

  const handlePrint = () => {
    // Construct the data object to be passed
    const data = {
      id: record,
      approvedBy: approvedBy,
      notedBy: notedBy,
      user: user,
    };

    localStorage.setItem("printData", JSON.stringify(data));
    // Open a new window with PrintRefund component
    const newWindow = window.open(`/print-cash`, "_blank");

    // Optional: Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  const isImageFile = (fileUrl: any) => {
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"];
    const extension = fileUrl.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  const handleViewImage = (imageUrl: any) => {
    setCurrentImage(imageUrl);
    setIsImgModalOpen(true);
  };

  const closeImgModal = () => {
    setIsImgModalOpen(false);
    setCurrentImage(null);
  };

  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3));
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.2, 1));
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleLongPressStart = (e: any) => {
    if (zoom > 1) {
      const startX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      const startY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
      setStartPosition({ x: startX - position.x, y: startY - position.y });

      longPressTimeout.current = window.setTimeout(() => {
        setDragging(true);
      }, 500) as unknown as number;
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current !== null) {
      clearTimeout(longPressTimeout.current);
    }
    setDragging(false);
  };

  const handleMouseMove = (e: any) => {
    if (dragging) {
      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

      setPosition({
        x: clientX - startPosition.x,
        y: clientY - startPosition.y,
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="relative z-10 w-full p-4 mx-10 overflow-scroll bg-white border-black shadow-lg md:mx-0 md:w-1/2 lg:w-2/3 space-y-auto h-4/5">
        <div className="sticky flex justify-end cursor-pointer top-2">
          <XMarkIcon
            className="w-8 h-8 p-1 text-black bg-white rounded-full "
            onClick={closeModal}
          />
        </div>
        <div className="flex flex-col items-start justify-start w-full space-y-4">
          {!fetchingApprovers && !isFetchingApprovers && (
            <>
              <button
                className="p-1 px-2 text-white bg-blue-600 rounded-md"
                onClick={handlePrint}
              >
                Print
              </button>
              {printWindow && (
                <PrintCash
                  data={{
                    id: record,
                    approvedBy: approvedBy,
                    notedBy: notedBy,
                    user: user,
                  }}
                />
              )}
            </>
          )}
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="font-semibold text-[18px]">
                Application for Cash Advance
              </h1>
            </div>
            <div className="flex w-auto ">
              <p>Date: </p>
              <p className="pl-1 font-bold">
                {formatDate(editableRecord.created_at)}
              </p>
            </div>
          </div>

          <p className="font-medium text-[14px]">
            Request ID: {record.request_code}
          </p>
          <div className="flex items-center w-full md:w-1/2">
            <p>Status:</p>
            <p
              className={`${
                record.status.trim() === "Pending"
                  ? "bg-yellow"
                  : record.status.trim() === "Approved"
                  ? "bg-green"
                  : record.status.trim() === "Disapproved"
                  ? "bg-pink"
                  : record.status.trim() === "Ongoing"
                  ? "bg-primary"
                  : "bg-blue-700"
              } rounded-lg  py-1 w-1/3
             font-medium text-[14px] text-center ml-2 text-white`}
            >
              {" "}
              {record.status}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex w-1/2 ">
              <h1 className="flex items-center">Branch: </h1>
              <p className="w-full pl-1 font-bold bg-white rounded-md ">
                {branchName}
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="mr-5">
              <div className="w-full overflow-x-auto">
                <div className="w-full border-collapse">
                  <table className="w-full border border-collapse border-black lg:overflow-auto xl:table-fixed">
                    <thead>
                      <tr>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th
                          colSpan={2}
                          className="text-center text-sm bg-[#8EC7F7]"
                        >
                          Itinerary
                        </th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th
                          colSpan={2}
                          className="text-center text-sm bg-[#8EC7F7]"
                        >
                          Hotel
                        </th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                      </tr>
                      <tr>
                        <th className={`${headerStyle}`}>Date</th>
                        <th className={`${headerStyle}`}>Day</th>
                        <th className={`${headerStyle}`}>From</th>
                        <th className={`${headerStyle}`}>To</th>
                        <th className={`${headerStyle}`}>Activity</th>
                        <th className={`${headerStyle}`}>Name</th>
                        <th className={`${headerStyle}`}>Rate</th>
                        <th className={`${headerStyle}`}>Per Diem</th>
                        <th className={`${headerStyle}`}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isEditing
                        ? newData.map((item, index) => (
                            <tr key={index}>
                              <td className="break-words tableCellStyle">
                                <input
                                  type="date"
                                  value={item.cashDate}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "cashDate",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.day}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "day",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.from}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "from",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.to}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "to",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.activity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "activity",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.hotel}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "hotel",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.rate}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.perDiem}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "perDiem",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                              <td className="break-words border-2 border-black tableCellStyle">
                                <input
                                  type="text"
                                  value={item.remarks}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "remarks",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white"
                                />
                              </td>
                            </tr>
                          ))
                        : editableRecord.form_data[0].items.map(
                            (item, index) => (
                              <tr key={index}>
                                <td className={tableCellStyle}>
                                  {formatDate2(item.cashDate)}
                                </td>
                                <td className={tableCellStyle}>{item.day}</td>
                                <td className={tableCellStyle}>{item.from}</td>
                                <td className={tableCellStyle}>{item.to}</td>
                                <td className={tableCellStyle}>
                                  {item.activity}
                                </td>
                                <td className={tableCellStyle}>{item.hotel}</td>
                                <td className={tableCellStyle}>{item.rate}</td>
                                <td className={tableCellStyle}>
                                  {item.perDiem}
                                </td>
                                <td className={tableCellStyle}>
                                  {item.remarks}
                                </td>
                              </tr>
                            )
                          )}
                    </tbody>
                  </table>
                </div>
              </div>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>
            <div>
              <div className="inline-block w-full">
                <table className="border border-black h-fit">
                  <thead>
                    <tr>
                      <th colSpan={2} className="bg-[#8EC7F7]">
                        <p className="font-semibold text-[12px]">
                          SUMMARY OF EXPENSES TO BE INCURRED (for C/A)
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`${tableStyle}`}>
                        <p className="text-sm font-semibold">BOAT FARE</p>
                      </td>
                      <td className={`${inputStyle}`}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={newTotalBoatFare}
                            onChange={(e) =>
                              setNewTotalBoatFare(e.target.value)
                            }
                            className="w-full bg-white"
                            readOnly={!isEditing}
                          />
                        ) : (
                          parseFloat(
                            editableRecord.form_data[0].totalBoatFare
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={`${tableStyle}`}>
                        <p className="text-sm font-semibold">HOTEL</p>
                      </td>
                      <td className={`${inputStyle}`}>
                        {newData.reduce(
                          (totalHotelRate, item) =>
                            totalHotelRate + Number(item.rate),
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={`${tableStyle} `}>
                        <p className="text-sm font-semibold">PER DIEM</p>
                      </td>
                      <td className={`${inputStyle}`}>
                        {/* Display calculated total per diem */}
                        {newData.reduce(
                          (totalPerDiem, item) =>
                            totalPerDiem + Number(item.perDiem),
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={`${tableStyle}`}>
                        <p className="text-sm font-semibold">FARE</p>
                      </td>
                      <td className={`${inputStyle}`}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={newTotalFare}
                            onChange={(e) => setNewTotalFare(e.target.value)}
                            className="w-full bg-white"
                            readOnly={!isEditing}
                          />
                        ) : (
                          parseFloat(
                            editableRecord.form_data[0].totalFare
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={`${tableStyle}`}>
                        <p className="text-sm font-semibold">CONTINGENCY</p>
                      </td>
                      <td className={`${inputStyle}`}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={newTotalContingency}
                            onChange={(e) =>
                              setNewTotalContingency(e.target.value)
                            }
                            className="w-full bg-white"
                            readOnly={!isEditing}
                          />
                        ) : (
                          parseFloat(
                            editableRecord.form_data[0].totalContingency
                          ).toFixed(2)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className={`${tableStyle} py-1`}></td>
                      <td className={`${tableStyle}`}></td>
                    </tr>
                    <tr>
                      <td className={`${tableStyle} font-bold text-sm`}>
                        TOTAL
                      </td>
                      <td
                        className={`${tableStyle} whitespace-nowrap text-center font-bold`}
                      >
                        ₱{" "}
                        {isEditing
                          ? calculateGrandTotal()
                          : editableRecord.form_data[0].grand_total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="my-2">
              <button
                onClick={openAddCustomModal}
                className="p-2 text-white rounded bg-primary"
              >
                Edit Approver
              </button>
            </div>
          )}
          <div className="flex-col items-center justify-center w-full">
            {isFetchingApprovers ? (
              <div className="flex items-center justify-center w-full h-40">
                <h1>Fetching..</h1>
              </div>
            ) : (
              <div className="flex flex-wrap">
                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Requested By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    <li className="relative flex flex-col items-center justify-center w-auto text-center">
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Signature */}
                        {user.data?.signature && (
                          <div className="absolute -top-4">
                            <img
                              src={user.data?.signature}
                              alt="avatar"
                              width={120}
                              className="relative z-20 pointer-events-none"
                              draggable="false"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                            />
                          </div>
                        )}
                        {/* Name */}
                        <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                          <span className="relative z-10">
                            {user.data?.firstName} {user.data?.lastName}
                          </span>
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                        </p>
                        {/* Position */}
                        <p className="font-bold text-[12px] text-center mt-1">
                          {user.data?.position}
                        </p>
                        {/* Status, if needed */}
                        {user.data?.status && (
                          <p
                            className={`font-bold text-[12px] text-center mt-1 ${
                              user.data?.status === "Approved"
                                ? "text-green"
                                : user.data?.status === "Pending"
                                ? "text-yellow"
                                : user.data?.status === "Rejected"
                                ? "text-red"
                                : ""
                            }`}
                          >
                            {user.data?.status}
                          </p>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Noted By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {notedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-4">
                              <img
                                src={user.signature}
                                alt="avatar"
                                width={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green"
                                  : user.status === "Pending" || !user.status
                                  ? "text-yellow"
                                  : ""
                              }`}
                            >
                              {user.status ? user.status : "Pending"}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Approved By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {approvedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-4">
                              <img
                                src={user.signature}
                                alt="avatar"
                                width={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green"
                                  : user.status === "Pending" || !user.status
                                  ? "text-yellow"
                                  : ""
                              }`}
                            >
                              {user.status ? user.status : "Pending"}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="w-full">
            {isEditing && (
              <div className="w-full max-w-md p-4">
                <p className="mb-3 font-semibold">Upload attachment:</p>
                <div
                  className={`relative w-full p-6 text-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
                    ${isHovering ? "bg-gray-200" : "hover:bg-gray-100"}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("files")?.click()}
                >
                  <input
                    type="file"
                    id="files"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-gray-500">
                    Drag and drop your images here <br /> or <br />
                    <span className="text-blue-500">click to upload</span>
                  </p>
                </div>
              </div>
            )}
            {newAttachments.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 font-semibold">Attachments:</p>
                <button
                  onClick={() => setNewAttachments([])}
                  className="px-3 py-1 text-xs text-white bg-red-700 rounded-lg hover:bg-red-500"
                >
                  Remove All
                </button>
              </div>
            )}
            <div className="max-w-[500px] overflow-x-auto pb-3">
              <div className="flex gap-1">
                {attachmentUrl.map((fileItem, index) => (
                  <div
                    key={fileItem}
                    className="relative w-24 p-2 bg-white rounded-lg shadow-md"
                  >
                    <div className="relative w-20">
                      {isImageFile(fileItem) ? (
                        // Display image preview if file is an image
                        <>
                          <img
                            src={fileItem}
                            alt="attachment"
                            className="object-cover w-full h-20 rounded-md"
                          />

                          {!isEditing ? (
                            <div className="px-3 py-1 mt-2 text-xs text-center text-white rounded-lg bg-primary">
                              <button
                                onClick={() => handleViewImage(fileItem)}
                                className="text-xs"
                              >
                                View
                              </button>
                            </div>
                          ) : (
                            <p key={index} className="text-center">
                              <button
                                onClick={() => handleRemoveAttachment(index)}
                                className="px-3 py-1 mt-2 text-xs text-white bg-red-500 rounded-lg"
                              >
                                Remove
                              </button>
                            </p>
                          )}
                        </>
                      ) : (
                        // Display document icon if file is not an image
                        <>
                          <div className="flex items-center justify-center w-full h-20 bg-gray-100 rounded-md">
                            <img src="https://cdn-icons-png.flaticon.com/512/3396/3396255.png" alt="" />
                          </div>
                          <div className="mt-2">
                            {!isEditing ? (
                              <a
                                href={fileItem}
                                download
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1 text-xs text-white rounded-lg bg-primary"
                              >
                                Download
                              </a>
                            ) : (
                              <p key={index} className="text-center">
                                <button
                                  onClick={() => handleRemoveAttachment(index)}
                                  className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg"
                                >
                                  Remove
                                </button>
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {newAttachments.map((fileItem) => (
                  <div
                    key={fileItem.name}
                    className="relative w-24 p-2 bg-white rounded-lg shadow-md"
                  >
                    <div className="relative">
                      {fileItem.type.startsWith("image/") ? (
                        // Display image preview if file is an image
                        <img
                          src={URL.createObjectURL(fileItem)}
                          alt={fileItem.name}
                          className="object-cover w-full h-20 rounded-md"
                        />
                      ) : (
                        // Display document icon if file is not an image
                        <div className="flex items-center justify-center w-full h-20 bg-gray-100 rounded-md">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/3396/3396255.png"
                            alt=""
                          />
                        </div>
                      )}

                      {/* Display File Name and Size */}
                      <div className="mt-2">
                        <p key={fileItem.name} className="text-center">
                          <button
                            onClick={() => handleRemoveImage(fileItem.name)}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg"
                          >
                            Remove
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isImgModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center w-full bg-black bg-opacity-75"
                  onClick={closeImgModal}
                >
                  <div className={zoom > 1 ? "w-4/5" : ""}>
                    <div
                      className="relative rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleLongPressEnd}
                      onTouchMove={handleMouseMove}
                      onTouchEnd={handleLongPressEnd}
                    >
                      <div
                        className="overflow-hidden"
                        style={{
                          cursor: dragging
                            ? "grabbing"
                            : zoom > 1
                            ? "grab"
                            : "default",
                        }}
                        onMouseDown={handleLongPressStart}
                        onTouchStart={handleLongPressStart}
                      >
                        <img
                          src={currentImage || ""}
                          alt="Viewed"
                          className="object-contain w-full max-h-screen transform"
                          style={{
                            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                          }}
                        />
                      </div>

                      <div className="fixed flex w-10 h-10 gap-8 text-4xl text-white rounded-full right-48 top-4">
                        <button
                          onClick={resetZoom}
                          className="w-10 h-10 text-lg text-white"
                        >
                          Reset
                        </button>
                        <button
                          onClick={zoomOut}
                          className="w-10 h-10 text-4xl text-white"
                        >
                          -
                        </button>
                        <button
                          onClick={zoomIn}
                          className="w-10 h-10 text-4xl text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={closeImgModal}
                        className="fixed w-10 h-10 text-4xl text-white right-4 top-4"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* <div>
              {attachmentUrl
                .filter((_, index) => !removedAttachments.includes(index))
                .map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {url.split("/").pop()}
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

              {attachmentUrl.filter(
                (_, index) => !removedAttachments.includes(index)
              ).length === 0 && (
                <p className="text-gray-500">No attachments available.</p>
              )}
            </div> */}
          </div>

          <div className="w-full">
            <h2 className="mb-2 text-lg font-bold">Comments</h2>

            {/* Check if there are no comments in both notedBy and approvedBy */}
            {notedBy.filter((user) => user.comment).length === 0 &&
            approvedBy.filter((user) => user.comment).length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              <>
                {/* Render Noted By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {notedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <img
                            alt="avatar"
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>

                {/* Render Approved By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {approvedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <img
                            alt="avatar"
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>
              </>
            )}
          </div>

          <div className="items-center md:absolute right-20 top-2">
            {isEditing ? (
              <div>
                <button
                  className="items-center h-10 p-2 text-white bg-primary rounded-xl"
                  onClick={handleSaveChanges}
                >
                  {loading ? (
                    <BeatLoader color="white" size={10} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  className="p-2 ml-2 text-white bg-red-600 rounded-xl"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              !fetchingApprovers &&
              !isFetchingApprovers &&
              editableRecord.status === "Pending" && (
                <button
                  className="flex p-2 ml-2 text-white bg-blue-500 rounded-xl"
                  onClick={handleEdit}
                >
                  <PencilIcon className="w-6 h-6 mr-2" />
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {savedSuccessfully && (
        <EditStockModalSuccess
          closeSuccessModal={closeModal}
          refreshData={refreshData}
        />
      )}
      <AddCustomModal
        modalIsOpen={isModalOpen}
        closeModal={closeModals}
        openCompleteModal={() => {}}
        entityType="Approver"
        initialNotedBy={notedBy}
        initialApprovedBy={approvedBy}
        refreshData={() => {}}
        handleAddCustomData={handleAddCustomData}
      />
    </div>
  );
};

export default ViewCashAdvanceModal;
