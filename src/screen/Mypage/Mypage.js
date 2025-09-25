import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, UserCircle2 } from "lucide-react";

export default function UserProfile() {
    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <UserCircle2 className="w-16 h-16 text-gray-500" />
                    <h2 className="text-xl font-semibold">홍길동</h2>
                </div>
                <Settings className="w-6 h-6 text-gray-600" />
            </div>

            <div className="space-y-2 mb-4">
                <div>
                    <label className="block text-sm text-gray-600">성명</label>
                    <Input value="홍길동" readOnly className="bg-blue-100" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600">전화번호</label>
                    <Input value="010-xxxx-eeee" readOnly className="bg-blue-100" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600">이메일</label>
                    <Input value="qwer@naver.com" readOnly className="bg-blue-100" />
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <Button variant="outline" className="w-full">정보 수정</Button>
                <Button variant="outline" className="w-full">알림 설정</Button>
                <Button variant="outline" className="w-full">로그아웃</Button>
                <Button variant="outline" className="w-full text-red-600 border-red-400">회원 탈퇴</Button>
            </div>

            <div>
                <h3 className="text-lg font-bold border-b pb-1 mb-2">내가 본 레시피</h3>
                <div className="grid grid-cols-3 gap-2">
                    <Card className="p-1">
                        <img src="/images/recipe1.jpg" alt="치즈 부대찌개" className="rounded-xl" />
                        <CardContent className="text-xs mt-1">웹 가득 치즈 부대찌개</CardContent>
                    </Card>
                    <Card className="p-1">
                        <img src="/images/recipe2.jpg" alt="냉면" className="rounded-xl" />
                        <CardContent className="text-xs mt-1">시원한 냉면 요리</CardContent>
                    </Card>
                    <Card className="p-1">
                        <img src="/images/recipe3.jpg" alt="돼지고기 조림" className="rounded-xl" />
                        <CardContent className="text-xs mt-1">폴라로 만든 돼지고기 조림</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}