import { NextRequest, NextResponse } from 'next/server';
import { activityApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const eventType = searchParams.get('event_type');
    const targetType = searchParams.get('target_type');

    const query: any = {
      page: parseInt(page),
      page_size: parseInt(pageSize),
    };

    if (eventType) query.event_type = eventType;
    if (targetType) query.target_type = targetType;

    let response;
    if (userId) {
      response = await activityApi.getUserActivities(parseInt(userId), query);
    } else {
      response = await activityApi.getFeed(query);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const requiredFields = ['user_id', 'event_type', 'target_type', 'target_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 设置默认值
    const activityData = {
      ...body,
      visibility: body.visibility || 'public',
    };

    const response = await activityApi.create(activityData);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}