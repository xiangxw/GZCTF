import { FC, useState } from 'react';
import { mutate } from 'swr';
import {
  Avatar,
  Box,
  Button,
  Center,
  Grid,
  Group,
  Image,
  Modal,
  ModalProps,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useInputState } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { mdiAirHorn, mdiCheck, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import api, { TeamInfoModel } from '../Api';

const dropzoneChildren = (status: DropzoneStatus, file: File | null) => (
  <Group position="center" spacing="xl" style={{ minHeight: 240, pointerEvents: 'none' }}>
    {file ? (
      <Image fit="contain" src={URL.createObjectURL(file)} alt="avatar" />
    ) : (
      <Box>
        <Text size="xl" inline>
          拖放图片或点击此处以选择头像
        </Text>
        <Text size="sm" color="dimmed" inline mt={7}>
          请选择小于 3MB 的图片
        </Text>
      </Box>
    )}
  </Group>
);

interface TeamEditModalProps extends ModalProps {
  team: TeamInfoModel | null;
}

const TeamEditModal: FC<TeamEditModalProps> = (props) => {
  const { team, ...modalProps } = props;

  const [disabled, setDisabled] = useState(false);
  const [tname, setTname] = useInputState('');
  const [dropzoneOpened, setDropzoneOpened] = useState(false);
  const [tid, setTid] = useInputState('');
  const [bio, setBio] = useInputState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const onSaveChange = () => {
    setDisabled(true);
    if ((tname && tname != team?.name) || (bio && bio != team?.bio)) {
      changeInfo();
    } else {
      showNotification({
        color: 'red',
        title: '你没有做任何修改',
        message: '这很值得',
        icon: <Icon path={mdiAirHorn} size={1} />,
        disallowClose: true,
      });
    }
    setDisabled(false);
  };

  const onClearInfo = () => {
    setDisabled(true);

    setTname('');
    setTid('');
    setBio('');

    setDisabled(false);
  };

  const onChangeAvatar = () => {
    if (avatarFile && team?.id) {
      api.team
        .teamAvatar(team.id, {
          file: avatarFile,
        })
        .then(() => {
          showNotification({
            color: 'teal',
            title: '修改头像成功',
            message: '您的头像已经更新',
            icon: <Icon path={mdiCheck} size={1} />,
            disallowClose: true,
          });
          mutate({ ...team });
          setAvatarFile(null);
          setDropzoneOpened(false);
        })
        .catch((err) => {
          showNotification({
            color: 'red',
            title: '遇到了问题',
            message: `${err.error.title}`,
            icon: <Icon path={mdiClose} size={1} />,
          });
          setDropzoneOpened(false);
        });
    }
  };

  const changeInfo = () => {
    if ((tname || bio) && team?.id) {
      api.team
        .teamUpdateTeam(team.id, {
          name: tname || team?.name,
          bio: bio || team?.bio,
        })
        .then(() => {
          showNotification({
            color: 'teal',
            title: '你改变了一些东西',
            message: '但值得吗？',
            icon: <Icon path={mdiCheck} size={1} />,
            disallowClose: true,
          });
          onClearInfo();
          mutate({ ...team });
        })
        .catch((err) => {
          showNotification({
            color: 'red',
            title: '遇到了问题',
            message: `${err.error.title}`,
            icon: <Icon path={mdiClose} size={1} />,
          });
        });
    }
  };

  const C_NameAvatar = () => (
    <Grid grow>
      <Grid.Col span={8}>
        <TextInput
          label="队伍名称"
          type="text"
          placeholder={team?.name ?? 'ctfteam'}
          style={{ width: '100%' }}
          value={tname}
          disabled={disabled}
          onChange={(event) => setTname(event.currentTarget.value)}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <Center>
          <Avatar
            style={{ borderRadius: '50%' }}
            size={70}
            src={team?.avatar}
            onClick={() => setDropzoneOpened(true)}
          />
        </Center>
      </Grid.Col>
    </Grid>
  );

  const C_ControlButton = () => (
    <Box style={{ margin: 'auto', width: '100%' }}>
      <Grid grow>
        <Grid.Col span={8}>
          <Button fullWidth variant="outline" disabled={disabled} onClick={onSaveChange}>
            保存
          </Button>
        </Grid.Col>
        <Grid.Col span={4}>
          <Button fullWidth color="red" variant="outline" disabled={disabled} onClick={onClearInfo}>
            清除变更
          </Button>
        </Grid.Col>
      </Grid>
    </Box>
  );

  const C_ChangeAvatar = () => (
    <Modal
      opened={dropzoneOpened}
      onClose={() => setDropzoneOpened(false)}
      centered
      withCloseButton={false}
    >
      <Dropzone
        onDrop={(files) => setAvatarFile(files[0])}
        onReject={() => {
          showNotification({
            color: 'red',
            title: '文件上传失败',
            message: `请重新提交`,
            icon: <Icon path={mdiClose} size={1} />,
          });
        }}
        style={{
          margin: '0 auto 20px auto',
          minWidth: '220px',
          minHeight: '220px',
        }}
        maxSize={3 * 1024 * 1024}
        accept={IMAGE_MIME_TYPE}
      >
        {(status) => dropzoneChildren(status, avatarFile)}
      </Dropzone>
      <Button fullWidth variant="outline" disabled={disabled} onClick={onChangeAvatar}>
        修改头像
      </Button>
    </Modal>
  );

  return (
    <Modal {...modalProps}>
      <Stack>
        <Text>**开发中，不可用。**</Text>
        <Text>{team?.name ?? 'new'}</Text>
        <Text>{team?.id ?? '0'}</Text>
        {/* <Paper
          style={{ width: '55%', padding: '5%', paddingTop: '2%', marginTop: '5%' }}
          shadow="sm"
          p="lg"
        > */}
        {/* User Info */}
        <Stack spacing="lg" style={{ marginTop: '15px' }}>
          <C_NameAvatar />
          <TextInput
            label="队伍 Id"
            type="number"
            placeholder={team?.id?.toString() ?? '123456789'}
            style={{ width: '100%' }}
            value={tid}
            disabled={disabled}
            onChange={(event) => setTid(event.currentTarget.value)}
          />
          <Textarea
            label="队伍签名"
            placeholder={team?.bio ?? '这个人很懒，什么都没有写'}
            value={bio}
            style={{ width: '100%' }}
            disabled={disabled}
            autosize
            minRows={2}
            maxRows={4}
            onChange={(event) => setBio(event.currentTarget.value)}
          />
          <C_ControlButton />
        </Stack>
        {/* </Paper> */}
      </Stack>
      <C_ChangeAvatar />
    </Modal>
  );
};

export default TeamEditModal;
