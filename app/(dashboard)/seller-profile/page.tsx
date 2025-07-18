"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import SellerDetailsModal from "./_components/farm-details-modal";
import PacificPagination from "@/components/ui/PacificPagination";
import DeleteConfirmationModal from "./_components/DeleteConfirmationModal"; // Import the new modal

// Interfaces (unchanged)
interface Seller {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  avatar: { public_id: string; url: string };
  address: { street: string; city: string; state: string; zipCode: string };
  verificationInfo: { verified: boolean; token: string };
  credit: number | null;
  role: string;
  fine: number;
  uniqueId: string;
  createdAt: string;
  updatedAt: string;
  farm?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    sellers: Seller[];
    total: number;
    page: number;
    limit: number;
  };
}

interface Session {
  accessToken?: string;
}

export default function SellerProfilePage() {
  const [page, setPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete modal
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null); // State for seller to delete
  const { data: session } = useSession();
  const token = (session as Session)?.accessToken;
  const queryClient = useQueryClient();

  const {
    data: sellersData,
    isLoading,
  } = useQuery<ApiResponse>({
    queryKey: ["sellers", page],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/sellers?page=${page}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sellers");
        }
        return response.json();
      } catch (err) {
        toast.error("An error occurred while fetching sellers.");
        throw err;
      }
    },
  });

  const pagination = useMemo(() => {
    const total = sellersData?.data?.total || 0;
    const limit = sellersData?.data?.limit || 10;
    const page = sellersData?.data?.page || 1;
    return {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }, [sellersData]);

  const sellers = sellersData?.data?.sellers || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sellers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete seller");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Seller deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
    onError: () => {
      toast.error("Failed to delete seller");
    },
  });

  const handleDeleteClick = (seller: Seller) => {
    setSellerToDelete(seller); // Set the seller to delete
    setDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const handleConfirmDelete = () => {
    if (sellerToDelete) {
      deleteMutation.mutate(sellerToDelete._id); // Trigger the delete mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
          <nav className="text-sm text-gray-500">
            Dashboard {">"} Seller Profile
          </nav>
        </div>
        <div className="bg-green-600 text-white px-4 py-2 rounded">
          <div className="text-sm">Total Sellers</div>
          <div className="text-lg font-bold">
            {pagination.total.toLocaleString()}
          </div>
        </div>
      </div>

      <Card className="bg-transparent shadow-none border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-base text-[#272727] font-medium">
                <TableHead>Seller ID</TableHead>
                <TableHead>Seller Name</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length > 0 ? (
                sellers.map((seller) => (
                  <TableRow
                    className="text-base text-[#595959] font-medium"
                    key={seller._id}
                  >
                    <TableCell className="font-mono">
                      {seller.uniqueId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              seller.avatar?.url ||
                              "/placeholder.svg?height=32&width=32"
                            }
                          />
                          <AvatarFallback>
                            {seller.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{seller.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {seller.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          seller.verificationInfo.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {seller.verificationInfo.verified
                          ? "Verified"
                          : "Unverified"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{seller.address?.city || "N/A"}</div>
                        <div className="text-muted-foreground">
                          {seller.address?.state || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50 cursor-pointer"
                        onClick={() => setSelectedSeller(seller)}
                      >
                        See Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(seller)} // Pass the entire seller object
                        aria-label={`Delete seller ${seller.name}`}
                        className="ml-2 cursor-pointer bg-[#039B06] text-white hover:text-[#039B06]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No sellers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {pagination.total > 0 && (
            <div className="flex justify-between items-center p-4">
              <div className="text-sm text-muted-foreground">
                Showing {sellers.length} of {pagination.total} sellers
              </div>
              <div>
                <PacificPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPage}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSeller && (
        <SellerDetailsModal
          open={!!selectedSeller}
          onOpenChange={() => setSelectedSeller(null)}
          seller={selectedSeller}
        />
      )}

      {sellerToDelete && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          sellerName={sellerToDelete.name}
        />
      )}
    </div>
  );
}