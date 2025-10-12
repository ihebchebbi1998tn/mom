// Helper functions for delete operations

export const deleteVideo = async (videoId: number): Promise<boolean> => {
  try {
    const response = await fetch('https://spadadibattaglia.com/mom/api/videos.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: videoId })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
};

export const deleteSubPack = async (subPackId: number): Promise<boolean> => {
  try {
    const response = await fetch('https://spadadibattaglia.com/mom/api/sub_packs.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: subPackId })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting sub pack:', error);
    return false;
  }
};

export const deleteCoursePack = async (packId: number): Promise<boolean> => {
  try {
    const response = await fetch('https://spadadibattaglia.com/mom/api/course_packs.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: packId })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting course pack:', error);
    return false;
  }
};