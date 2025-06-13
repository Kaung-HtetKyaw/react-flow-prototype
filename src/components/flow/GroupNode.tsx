import { type NodeProps } from "@xyflow/react";

export const GroupNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`flex h-[24px] w-fit items-center justify-center rounded-br-[8px] rounded-tl-[8px] bg-[#26C300] p-[8px] text-white`}
    >
      <div className="flex flex-row items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M2 4.00002C2 3.26364 2.59695 2.66669 3.33333 2.66669H5.95309C6.39889 2.66669 6.8152 2.88949 7.06249 3.26042L7.60418 4.07295C7.85147 4.44389 8.26777 4.66669 8.71358 4.66669H12.6667C13.403 4.66669 14 5.26364 14 6.00002V12C14 12.7364 13.403 13.3334 12.6667 13.3334H3.33333C2.59695 13.3334 2 12.7364 2 12V4.00002Z"
            stroke="#F3FFEE"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>{" "}
        <span> {data.label as string}</span>
      </div>

      {/* <div className="absolute left-4 top-2">
        <div className="text-lg font-bold text-purple-800">
          {data.label as string}
        </div>
        <div className="text-sm text-purple-600">
          {(data.description as string) || "Group container"}
        </div>
      </div> */}
    </div>
  );
};
