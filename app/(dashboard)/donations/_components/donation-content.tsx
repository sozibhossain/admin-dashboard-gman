"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSession } from "next-auth/react";

interface Donation {
  _id: string;
  userId: {
    name: string;
    email: string;
  } | null;
  price: number;
  paymentStatus: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

interface DonationResponse {
  success: boolean;
  message: string;
  data: Donation[];
  total?: number;
  totalPage?: number;
  page?: number;
}

export default function DonationsContent() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useQuery<DonationResponse>({
    queryKey: ["donations", page, token],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/donation?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      return response.json();
    },
    enabled: !!token,
  });

  if (isLoading) {
    return <div>Loading donations...</div>;
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  const donations = data?.data || [];
  const pagination = {
    page: data?.page || 1,
    total: data?.total || donations.length,
    totalPage: data?.totalPage || 1,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        <nav className="text-sm text-gray-500">Dashboard Donations</nav>
      </div>

      <div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mail</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.length > 0 ? (
                donations.map((donation) => (
                  <TableRow key={donation._id}>
                    <TableCell className="font-medium">
                      {donation.userId?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell>{donation.userId?.email ?? "N/A"}</TableCell>
                    <TableCell>${donation.price}</TableCell>
                    <TableCell>
                      {donation.createdAt
                        ? new Date(donation.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No donations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {pagination.totalPage > 1 && (
            <div className="flex justify-between items-center mt-4 p-4">
              <div className="text-sm text-muted-foreground">
                Showing {donations.length} of {pagination.total} donations
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {[...Array(pagination.totalPage)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(pagination.totalPage, p + 1))
                      }
                      className={
                        page === pagination.totalPage
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
